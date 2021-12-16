# ExportContext reference

This article provides reference material about `ExportContext` class.

`ExportContext` class provides extension developers with information needed during export process. It is available as a parameter in `OnStart`, `OnSuccess`, `OnFail` and `OnFinalize` methods of customer export extensions.

Sana automatically fills in `ExportContext` parameter of `OnStart`, `OnSuccess`, `OnFail` and `OnFinalize` methods with data from ShopAccounts, NewsetterSubscription, Baskets, etc.


## Properties

![ExportContext](img/customer-export-context/class.png)

### DefaultCurrency

Gets the default website currency.

### DefaultWebsiteLanguage

Gets the default website language.

### WebsiteLanguages

Gets the list of website languages.

### DefaultWebsiteDomain

Gets the default website domain.

### LogError

Gets the log errors method. This method gives ability to write error messages to text log file.

### Log

Gets the log errors method. This method gives ability to write information messages to text log file.

### CustomerStatisticsFields

Gets the customer statistics fields.

### LastRunTime

Gets the last run time.


## See also

[CustomersExportExtension reference](customer-export-extension.md)

[LoadOptions reference](customer-export-load-options.md)

[ProcessBatchContext reference](customer-export-process-batch-context.md)
