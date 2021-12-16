# ExportContext reference

This article provides reference material about `ExportContext` class.

`ExportContext` class provides extension developers with information needed during export process. It is available as a parameter in `OnStart`, `OnSuccess`, `OnFail` and `OnFinalize` methods of product export extensions.

Sana automatically fills in `ExportContext` parameter of `OnStart`, `OnSuccess`, `OnFail` and `OnFinalize` methods.


## Properties

![ExportContext](img/product-export-context/class.png)

### DefaultCurrency

Gets the default website currency.

### DefaultWebsiteLanguage

Gets the default website language.

### WebsiteLanguages

Gets the list of website languages.

### DefaultWebsiteDomain

Gets the default of website domain.

### WebsiteDomains

Gets the list of website domain.

### LogError

Gets the log errors method. This method gives ability to write error messages to text log file.

### Log

Gets the log errors method. This method gives ability to write information messages to text log file.


## See also

[ProductExportExtension reference](product-export-extension.md)

[LoadOptions reference](product-export-load-options.md)

[ProcessBatchContext reference](product-export-process-batch-context.md)
