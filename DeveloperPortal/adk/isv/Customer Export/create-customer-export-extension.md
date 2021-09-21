# Implementing new customer export extension

From this article you will learn how to create customer export extension. Custom customers export extension is used as an example in this article.

Please use the following reference articles to find more details on extensions infrastructure:

- [SanaApi reference](../reference/extension-api.md)
- [CustomersExportExtension reference](../reference/customer-export-extension.md)
- [ExportContext reference](../reference/customer-export-context.md)
- [ProcessBatchContext reference](../reference/customer-export-process-batch-context.md)
- [LoadOptions reference](../reference/customer-export-load-options.md)

## Start with a new project

Create a new add-on project named "Sana.Extensions.CustomCustomersExportExtension" as described in the [add-on development tutorial](develop-addon.md#CreateProject).

## Implement the extension class

Create a new class `CustomCustomersExportExtension` inherited from `CustomersExportExtension`.
More information about `CustomersExportExtension` can be found in
[CustomersExportExtension reference](../reference/customer-export-extension.md) article.

```cs
public class CustomCustomersExportExtension : CustomersExportExtension
{
}
```

## Implement configuration class

Create a new class `CustomersExportConfiguration ` inherited from the
`ExtensionConfiguration` and decorate it with `ConfigurationKey` attribute.
This class will be used by Sana as a view-model to configure customer
extension in Sana Admin. More details about extension configuration class can be found in
[Extension configuration](extension-configuration.md#ConfigurationClass) article.

```cs
[ConfigurationKey("CustomersConfiguration")]
public class CustomersExportConfiguration : ExtensionConfiguration
{
}
```

Let's add properties which are needed to configure the customer export extension to the
`CustomersExportConfiguration`.

```cs
[ConfigurationKey("CustomersConfiguration")]
public class CustomersExportConfiguration : ExtensionConfiguration
{
    [Display(Name = "User name", Description = "Name of API user.")]
    [Required]
    [DataType(DataType.Text)]
    public string Username { get; set; } = string.Empty;

    [Display(Name = "Password", Description = "Password of API user.")]
    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    [Display(Name = "File name", Description = "File name.")]
    [Required]
    [DataType(DataType.Text)]
    public string FileName { get; set; } = "Customers.json";
}
```

You can decorate the properties with data annotation attributes since this class is a model
for a view. See [Extension configuration](extension-configuration.md#integration-mode)
article for more details.

Implement `IConfigurable<TConfiguration>` interface in `CustomersExportConfiguration`.
Put `CustomersExportConfiguration` class as a generic type parameter for `IConfigurable<TConfiguration>`,
it will indicate that our customer extension should be configured with this class.

```cs
public class CustomersExportConfiguration : CustomersExportExtension, IConfigurable<CustomersExportConfiguration>
{
    public CustomersExportConfiguration Configuration { get; set; }
}
```

Sana will initialize `Configuration` property with configuration settings entered
in Sana Admin on the extension configuration page.

## Implement `GetLoadOptions` method

Implement `GetLoadOptions` method of `CustomersExportExtension` class.

This method provides ability to load specific data during export process.

See [LoadOptions reference](../reference/customer-export-load-options.md) of customer export
extension for more details.

```cs
public override LoadOptions GetLoadOptions() =>
    new LoadOptions
    {
        LoadBasket = true,
        LoadNewsletterSubscription = true,
        LoadSalesStatistics = true,
        LoadCustomerData = true,
    };
```

## Implement `OnStart` method

Implement `OnStart` method of `CustomersExportExtension` class.

This method is used to write `ExportContext` data to the file.

See [OnStart method](../reference/customer-export-extension.md#onstart) of customer export
extension for more details.

```cs

public override void OnStart(ExportContext context)
{
    context.Log(this, $"Start");

    var jsonSerializerSettings = CreateJsonSerializerSettings();

    Api.DataFiles.DeleteFile(Configuration.FileName);

    try
    {
        using (Stream stream = Api.DataFiles.OpenWrite(Configuration.FileName))
        using (StreamWriter writer = new StreamWriter(stream))
        {
            var json = JsonConvert.SerializeObject(context, jsonSerializerSettings);
            writer.Write(json);
        }
    }
    catch (Exception ex)
    {
         context.LogError(this, $"OnStart - Exception: {ex.Message}");
    }
}

private JsonSerializerSettings CreateJsonSerializerSettings()
{
    return new JsonSerializerSettings
    {
        Formatting = Formatting.Indented,
    };
}
```

## Implement `OnSuccess` method

Implement `OnSuccess` method of `CustomersExportExtension` class.

Sana calls `OnSuccess` method when execution of the extension successfully finished.

See [OnSuccess method](../reference/customer-export-extension.md#onsuccess) of customer export
extension for more details.

```cs
public override void OnSuccess(ExportContext context)
{
    context.Log(this, $"Customer export extension saved data to files");
    // If needed there can be code for logging, freeing memory, deleting temporary files, etc.
}
```

## Implement `OnFail` method

Implement `OnFail` method of `CustomersExportExtension` class.

This method is used to correctly finish extension execution when an error occurs.
Sana calls `OnFail` method when errors occurred during execution of the extension.

See [OnFail method](../reference/customer-export-extension.md#onfail) of customer export
extension for more details.

```cs
public override void OnFail(ExportContext context)
{
    context.LogError(this, $"Error occurred during execution of the customer export extension");
    // If needed there can be code to finish extension execution correctly (logging, freeing memory, deleting temporary files, etc).
}
```

## Implement `OnFinalize` method

Implement `OnFinalize` method of `CustomersExportExtension` class.

This method is called at the end of execution.

See [OnFinalize method](../reference/customer-export-extension.md#onfinalize) of customer export
extension for more details.

```cs
public override void OnFinalize(ExportContext context)
{
    context.Log(this, $"Customer export extension execution is completed.");
    // If needed there can be code to finish execution of the extension (logging, deleting temporary files, etc).
}
```

## Implement `ProcessBatch` method

Implement `ProcessBatch` method of `CustomersExportExtension` class.

This method is used to save data into temporary file based on loading options and task configurations.

See [ProcessBatch method](../reference/customer-export-extension.md#processbatch) of customer export
extension for more details.

```cs
public override void ProcessBatch(ProcessBatchContext context)
{
    var jsonSerializerSettings = CreateJsonSerializerSettings();

    try
    {
        using (Stream stream = Api.DataFiles.OpenWrite(Configuration.FileName))
        {
            stream.Seek(0, SeekOrigin.End);

            using (StreamWriter writer = new StreamWriter(stream))
            {
                var json = JsonConvert.SerializeObject(context.CustomersInfo, jsonSerializerSettings);
                writer.Write(json);
            }
        }
    }
    catch (Exception ex)
    {
        context.ExportContext.LogError(this, $"ProcessBatch - Exception: {ex.Message}");
    }
}
```

## Implement `GetFilesToExport` method

Implement `GetFilesToExport` method of `CustomersExportExtension` class.

This method returns extension files to be exported as result of the extension.

See [GetFilesToExport method](../reference/customer-export-extension.md#getfilestoexport) of customer export
extension for more details.

```cs
public override IEnumerable<string> GetFilesToExport()
{
    return Api.DataFiles.GetFiles();
}
```


## See also

[How-to develop an add-on](develop-addon.md)

[Extension.Api reference](../reference/extension-api.md)

[CustomersExportExtension reference](../reference/customer-export-extension.md)

[ExportContext reference](../reference/customer-export-context.md)

[ProcessBatchContext reference](../reference/customer-export-process-batch-context.md)

[LoadOptions reference](../reference/customer-export-load-options.md)

[Extension configuration](extension-configuration.md)
