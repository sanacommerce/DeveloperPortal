# Packaging and Add-on

Before deploying your Add-on, it first needs to be assembled into a redistributable package which can be then installed into any Sana installation.

To do this, just publish the add-on project to some directory and with the help of the previously imported "msbuild.targets" file, the add-on package will be assembled from the source project.
The easiest way to do this is to use the .NET Core CLI (assuming that the current working directory is the SDK solution root):
```sh
dotnet publish ".\Addons\Sana.Extensions.HeadingContentBlock" -c Release -o ".\publish"
```

As a result, the add-on will be packaged into the file `.\publish\HeadingContentBlock.1.0.0.sanapkg`.

## File & folder structure of an Add-on package

The Add-on package structure is based on the structure of NuGet packages.

Basically it's a zip archive with a specific filename format: `[PackageId].[PackageVersion].sanapkg`

### Package contents

- _sanamanifest.xml_: file contains package metadata (id, version, description, authors).
- _/themes_: the folder with one ore more theme files. After extension package installed these themes will appear in the Admin (_Design/Themes_)
- _/bin_: the folder which includes DLL files to be loaded into Sana. It includes extension itself and also could include additional libraries.
- _/adminresources_: contains RESX files which will be applied for the Admin.
- _/sanatexts_: contains RESX files to be applied for the webstore.
- _/spa_ or _/ClientApp_ (for development package): contains client application files.
  - _/admin_: contains extension client application files for admin.
    - _/admin/index.js_: contains exported from extension `epic`, `reducer` and editor components for `contentBlocks`, extension `configuration`, `paymentModules` and `shippingModules`.
  - _/webstore_: contains extension client application files for webstore.
    - _/webstore/index.js_: contains exported from extension `epic`, `reducer` and components for `contentBlocks` and `paymentModules`.

## The sanamanifest.xml file

This file contains the Add-on package's metadata.

> [!WARNING]
> The _SanaPackageInfo/metadata/type_ node with the value **Extension** is required in the [`sanamanifest.xml`](sanamanifest-file.md)

Here is an overview of the contents of the add-on package manifest file:

| Field | Description |
| --- | --- |
| **id** | A unique add-on identifier, which will stay constant across all future add-on versions.<br/>It should be a single word (preferrably in PascalCase) and should not conflict with any other add-ons. |
| **version** | An add-on version. Supported formats are: "X.X", "X.X.X" and "X.X.X.X", where X is a non-negative number.<br/>It is highly recommended to use the [Semantic Versioning](https://semver.org/) approach for add-ons versioning. |
| **title** | *(optional)* A human-readable name of the add-on which is shown to the users in Sana Admin. |
| **description** | *(optional)* A human-readable short description of the add-on which describes what add-on does. |
| **authors** | The list of add-on authors, separated by comma (`,`). |
| **type** | For Add-on packages, this field must always have the value of `Extension`. |
| **minSanaVersion** | The version of Sana Commerce SDK, the add-on is developed with.<br/>This will set a limitation, so that this add-on will be compatible only with the current and future versions of Sana Commerce and cannot be installed into an older Sana Commerce installation. |
| **maxSanaVersion** | *(optional)* The highest version of Sana Commerce this package is compatible with. |

### Example File

```xml
<SanaPackageInfo>
  <metadata>
    <id>MyUniqueAddonId</id>
    <version>1.0.0</version>
    <title>My Add-on title</title>
    <description>My Add-on description.</description>
    <authors>Partner X</authors>
    <type>Extension</type>
    <minSanaVersion>1.0.12</minSanaVersion>
  </metadata>
</SanaPackageInfo>
```

## What's next?

Continue with [deploying your Add-on](deployment.md).