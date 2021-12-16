# Payment configuration migration script template

```powershell
# This script migrates old payment settings to new extension system.
[CmdLetBinding()]
param($connectionString, $aesKey, $aesVector)

$ErrorActionPreference = 'Stop'

$script:Connection = $null

[byte[]]$script:AesKeyBytes = @()
[byte[]]$script:AesVectorBytes = @()

# specify payment module ID
$script:PaymentModuleId = ''

#specify extension settings ID
$script:ExtensionSettingsId = ''

function Migrate-ModuleConfiguration($fields, $decryptor) {
    #add code for payment module configuration migration
}

function Migrate-MethodConfiguration([Xml.XmlNode]$from, [Xml.XmlNode]$to) {
    #add code for payment method configuration migration
}

function Main() {
    function Step($Name) {
        Write-Verbose "`r`n### $Name"
    }

    Step 'Load types'; Load-Dlls
    Step 'Connect to database'; Init-Database

    try {
        Step 'Migrate module configuration'; Migrate-Module ('Payment_'+$PaymentModuleId) $ExtensionSettingsId
        Step 'Migrate method settings'; Migrate-Methods $PaymentModuleId
    }
    finally {
        $Connection.Dispose()
    }
}

function Init-Database {
    $script:Connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $script:Connection.Open()
}

function Load-Dlls {
    $simpleAesDefinition='
using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Sana
{
    public class SimpleAes : IDisposable
    {
        RijndaelManaged algorithm = new RijndaelManaged();
        const int saltSize = 16;

        byte[] key;
        byte[] vector;
        byte[] saltMarker = Encoding.UTF8.GetBytes("ENCVER=");

        public SimpleAes(byte[] key, byte[] vector)
        {
            this.key = key;
            this.vector = vector;
        }

        public string Decrypt(string encrypted)
        {
            var array = Convert.FromBase64String(encrypted);
            if (array.Length == 0)
                return Encoding.UTF8.GetString(array);

            var decryptStream = new MemoryStream();
            using (var cs = new CryptoStream(decryptStream, algorithm.CreateDecryptor(key, vector), CryptoStreamMode.Write))
            {
                cs.Write(array, 0, array.Length);
            }
            var decrypted = decryptStream.ToArray();
            var encVer = ReadEncryptionVersion(decrypted);
            switch (encVer)
            {
                case 1:
                    return Encoding.UTF8.GetString(decrypted);
                case 2:
                    {
                        var size = decrypted.Length - saltSize - saltMarker.Length - 1;
                        var data = new byte[size];
                        Buffer.BlockCopy(decrypted, saltSize, data, 0, size);

                        return Encoding.UTF8.GetString(data);
                    }
                default:
                    throw new CryptographicException("Unknown version of encryption.");
            }
        }

        int ReadEncryptionVersion(byte[] data)
        {
            if (data.Length < saltSize + saltMarker.Length + 1)
                return 1;

            var buffer = new byte[saltMarker.Length];
            Buffer.BlockCopy(data, data.Length - saltMarker.Length - 1, buffer, 0, saltMarker.Length);
            return buffer.SequenceEqual(saltMarker) ? data[data.Length - 1] : 1;
        }

        public void Dispose()
        {
            if (algorithm != null)
            {
                algorithm.Dispose();
                algorithm = null;
            }
            GC.SuppressFinalize(this);
        }
    }
}'

    Add-Type -TypeDefinition $simpleAesDefinition
    Remove-Variable simpleAesDefinition

    [System.Reflection.Assembly]::LoadWithPartialName('System.Data') | Out-Null
}

function Init-Aes() {
    $script:AesKeyBytes = HexString-To-ByteArray $aesKey
    $script:AesVectorBytes = HexString-To-ByteArray $aesVector
}

#region Migrate modules

function Migrate-Module ($oldKey, $newKey) {
    $simpleAes = $null

    foreach ($item in Get-ModuleConfigurations $oldKey) {
        if ($simpleAes -eq $null) {
            $errors = @()
            if ([string]::IsNullOrEmpty($aesKey)) { $errors += 'aesKey parameter is not specified' }
            if ([string]::IsNullOrEmpty($aesVector)) { $errors += 'aesVector parameter is not specified' }

            if ($errors.Length -gt 0) {
                Write-Warning 'Migration of payment module settings skipped due to the following reasons:' + ($errors | foreach { "`r`n  ",$_ })
                return
            }

            Write-Verbose 'Init AES'; Init-Aes
            $simpleAes = New-Object Sana.SimpleAes($AesKeyBytes, $AesVectorBytes)
        }

        try {
            $item.Fields = Migrate-ModuleConfiguration $item.Fields $simpleAes
        } catch {
            Write-Warning ("Could not map '{0}' configuration from web-site: '{1}'. Check Fields or configure extension manually in Sana Admin." -f $oldKey, $item.WebsiteId)
            continue
        }
        Delete-ModuleConfiguration $item.WebsiteId $newKey
        Save-ModuleConfiguration $item $newKey
        Delete-ModuleConfiguration $item.WebsiteId $oldKey
    }

    if ($simpleAes -ne $null) {
        $simpleAes.Dispose()
    }
}

function ExecuteScalar($commandText) {
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = $commandText
    try {
        $cmd.ExecuteScalar() | Out-Null
    }
    finally {
        $cmd.Dispose()
    }
}

function Get-ModuleConfigurations($key) {
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = "SELECT [Fields], [WebsiteId] FROM [dbo].[Settings] WHERE [Key]='$key'"
    $result = @()

    try{
        $reader = $cmd.ExecuteReader()
        while($reader.Read()) {
            $obj = new-object psobject -Property @{
                Fields = [xml]$reader["Fields"]
                WebsiteId = $reader["WebsiteId"]
            }
            $result += $obj
        }
    }
    finally {
        $reader.Dispose()
        $cmd.Dispose()
    }
    return $result
}

function Save-ModuleConfiguration($data, $key) {
    $webisteId = $data.WebsiteId; $fields = $data.Fields
    $fields = EncodeString($fields)
    ExecuteScalar("INSERT INTO  [dbo].[Settings] ([Fields],[WebsiteId],[Key],[CreatedDate],[ModifiedDate]) values('$fields', '$webisteId', '$key', GETDATE(), GETDATE())")

    Write-Debug "$key $webisteId`r`n$fields`r`n"
}

function Delete-ModuleConfiguration($websiteId, $key) {
    ExecuteScalar("DELETE FROM [dbo].[Settings] WHERE [Key]='$key' AND [WebsiteId]='$websiteId'")
}

#endregion Migrate modules

#region Migrate methods

function Migrate-Methods ($moduleId) {
    foreach ($item in Get-MethodConfigurations $moduleId) {
        try {
            $fields = [xml]$item.Fields
            $settingsNode = $fields.DocumentElement.SelectSingleNode('field[@name="Settings" and @type!="Null"]')
            if ($settingsNode -eq $null) {
                continue;
            }

            $settingsDictionaryNode = $settingsNode.FirstChild

            $methodSettingsNode = $fields.DocumentElement.SelectSingleNode('field[@name="MethodSettings"]')
            if ($methodSettingsNode -eq $null) {
                $methodSettingsNode = $fields.CreateElement('field')
                Add-Attribute $methodSettingsNode 'name' 'MethodSettings' -document $fields
                Add-Attribute $methodSettingsNode 'type' 'Null' -document $fields
                $fields.DocumentElement.InsertBefore($methodSettingsNode, $settingsNode) | Out-Null
            }

            Migrate-MethodConfiguration $settingsDictionaryNode $methodSettingsNode

            $settingsNode.RemoveChild($settingsDictionaryNode) | Out-Null
            $settingsNode.Attributes['type'].Value = 'Null'

            $item.Fields = $fields
        } catch {
            Write-Warning ("Could not map '{0}' method ('{1}'). Check Fields or fill method settings manually in Sana Admin." -f $item.Id, $m.ModuleId )
            continue
        }
        Update-MethodFields $item
    }
}

function Get-MethodConfigurations($moduleId) {
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = "SELECT [Fields], [Id] FROM [dbo].[PaymentMethods] WHERE [PaymentModuleId]='$moduleId'"
    $result = @()

    try{
        $reader = $cmd.ExecuteReader()

        while($reader.Read()) {
            $obj = new-object psobject -Property @{
                Fields = [xml]$reader["Fields"]
                Id = $reader["Id"]
            }
            $result += $obj
        }
    }
    finally {
        $reader.Dispose()
        $cmd.Dispose()
    }

    return $result
}

function Update-MethodFields($data) {
    $id = $data.Id; $fields = $data.Fields.DocumentElement.OuterXml
    $fields = EncodeString($fields)
    ExecuteScalar("UPDATE [dbo].[PaymentMethods] SET [Fields]='$fields' WHERE [Id]='$id'")
}

#endregion Migrate methods

#region Helpers

function EncodeString($data) {
    return $data.replace("'", "&apos;")
}

function Add-Attribute([System.Xml.XmlNode]$node, $name, $value, [xml]$document) {
    $attr = $document.CreateAttribute($name)
    $attr.Value = $value
    $node.Attributes.Append($attr) | Out-Null
}

function HexString-To-ByteArray([string]$hex) {
    $result = @()
    for($x = 0; $x -lt $hex.Length; $x += 2) {
        $result += [Convert]::ToByte($hex.Substring($x, 2), 16)
    }

    return [byte[]]$result
}

function Get-Field([xml]$xml, [string]$fieldName, [string]$defaultValue = $null) {
    $value = $xml.DocumentElement.SelectSingleNode("field[@name=`"$fieldName`"]").FirstChild.InnerText
    if ($value -eq $null) {
        $value = $defaultValue
    }
    return $value
}

function Get-Decrypted-Field([xml]$xml, [string]$fieldName, $decryptor, [string]$defaultValue = $null) {
    $node = $xml.DocumentElement.SelectSingleNode("field[@name=`"$fieldName`"]")
    if ($node -eq $null) {
        return $defaultValue
    }
    $value = $node.FirstChild.InnerText
    $encrypted = $node.Attributes['encrypted']
    if ($encrypted -ne $null -and $encrypted.Value -ne 'false') {
        $value = $decryptor.Decrypt($value)
    }

    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = $defaultValue
    }
    return $value
}

function Get-Decrypted-BooleanString([xml]$xml, [string]$fieldName, $decryptor, [bool]$defaultValue = $false) {
    $str = Get-Decrypted-Field $xml $fieldName $decryptor
    [bool]$value = $defaultValue
    if (-not [string]::IsNullOrWhiteSpace($str)) {
        $value = $str -ieq 'true' -or $str -ieq 'yes'
    }

    return $value.ToString().ToLower()
}

function Get-DictionaryValue([Xml.XmlNode]$dictionaryNode, [string]$key, [string]$defaultValue= $null) {
    $itemNode = $dictionaryNode.SelectSingleNode("./item[key/string='$key']")

    if ($itemNode -eq $null) {
        return $defaultValue
    }
    $value = $itemNode.SelectSingleNode('./value/string').InnerText
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $defaultValue
    }
    return $value
}

#endregion Helpers

Main
```