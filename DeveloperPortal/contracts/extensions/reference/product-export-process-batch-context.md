# ProcessBatchContext reference

This article provides reference material about `ProcessBatchContext` class.

`ProcessBatchContext` class provides extension developers with information needed during export process. It is available as a parameter in `ProcessBatch` method of product export extensions.

Sana automatically fills in `ProcessBatchContext` parameter of `ProcessBatch` method.

## Properties

![ProcessBatchContext](img/product-export-process-batch-context/class.png)

### ExportContext

Gets the export context. More information about export context you can find in
[product export context](product-export-context.md) article.

### Products

Gets the products information. Contains all product data.

## See also

[ProsuctExportExtension reference](product-export-extension.md)

[ExportContext reference](product-export-context.md)

[LoadOptions reference](product-export-load-options.md)
