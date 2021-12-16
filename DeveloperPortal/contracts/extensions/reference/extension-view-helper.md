# ExtensionViewHelper reference

This article provides reference material about `ExtensionViewHelper`.

`ExtensionViewHelper` class provides extension methods that are needed to render standard Sana elements.

## Methods

### FormatAsPercentage(decimal value, string currencyId = null)

Gets a formatted percentage.

```cs
@Extension.FormatAsPercentage(item.DiscountPercentage)
```

### FormatAsPrice(decimal price, string currencyId = null, bool includeCurrencySymbol = true)

Gets a formatted price.

```cs
@Extension.FormatAsPrice(Model.Amount)
```

### RichText(string groupCode)

Gets resource text as HTML including HTML tags and newline characters.

```cs
<div class="error-block">@Extensions.RichText("ErrorPage_ErrorText")</div>
```

### SimpleText(string groupCode)

Gets resource text as HTML but without any HTML tags and newline characters.

```cs
<span class="msg-not-available">@Extensions.SimpleText("Product_NotAvailable")</span>
```
