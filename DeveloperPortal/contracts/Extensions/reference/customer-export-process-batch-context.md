# ProcessBatchContext reference

This article provides reference material about `ProcessBatchContext` class.

`ProcessBatchContext` class provides extension developers with information needed during export process.
It is available as a parameter in `ProcessBatch` method of customer export extensions.

Sana automatically fills in `ProcessBatchContext` parameter of `ProcessBatch` method.

## Properties

![ProcessBatchContext](img/customer-export-process-batch-context/class.png)

### ExportContext

Gets the export context. More information about export context can be found in
[customer export context](customer-export-context.md) article.

### CustomersInfo

Gets the customers information. Contains all customer data such as shop account, basket, sales statistics and etc.

## See also

[CustomersExportExtension reference](customer-export-extension.md)

[ExportContext reference](customer-export-context.md)

[LoadOptions reference](customer-export-load-options.md)
