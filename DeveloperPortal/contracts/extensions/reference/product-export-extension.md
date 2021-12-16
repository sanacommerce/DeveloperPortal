# ProductExportExtension reference

This article provides reference material about `ProductExportExtension` class. All product export extensions
have to be inherited from the `ProductExportExtension` which, in turn, inherits from the core
Sana `Extension` class.

![ProductExportExtension inheritance](img/product-export-extension/inheritance.png)

## Methods

![ProductExportExtension](img/product-export-extension/class.png)

### GetLoadOptions

Gets load option `LoadOptions` for getting products' info.

```cs
public override LoadOptions GetLoadOptions() =>
    new LoadOptions
    {
        LoadEnrichment = true,
        LoadProductInfo = true,
        LoadImages = true,
        LoadInventory = true,
        LoadPrices = true,
        LoadUrls = true,
        LoadRelatedSkus = true,
        LoadRelatedProducts = true,
    };
```

### OnStart

Starts the product export process.

```cs
public override void OnStart(ExportContext context)
{
}
```

### OnSuccess

Sana calls `OnSuccess` method when execution of the task successfully finished.

```cs
public override void OnSuccess(ExportContext context)
{
}
```

### OnFail

Sana calls `OnFail` method when errors occurred during execution of the task.

```cs
public override void OnFail(ExportContext context)
{
}
```

### OnFinalize

This method is called at the end of execution.

```cs
public override void OnFinalize(ExportContext context)
{
}
```

### ProcessBatch

This method processes data based on loading options and task configurations.

Sana calls `ProcessBatch` method after `OnStart` method has been called.

```cs
public override void ProcessBatch(ProcessBatchContext context)
{
}
```

### GetFilesToExport

This method returns extension files to be exported as result of the task.

Extension files coping to the Sana content folder `@data/contentfiles/Product feeds/{website ID}/{extension title}/{extension file path}` during OnSuccess call.

```cs
public override IEnumerable<string> GetFilesToExport()
{
    return Api.DataFiles.GetFiles();
}
```


## See also

[ExportContext reference](product-export-context.md)

[LoadOptions reference](product-export-load-options.md)

[ProcessBatchContext reference](product-export-process-batch-context.md)
