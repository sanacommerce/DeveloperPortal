# Extension.Api.MailManager reference

Every extension in Sana has access to mail sending functionality via its `Api.MailManager`. This property holds an instance of `MailManager` type which serves as an entry 
point to mailing functionality.

## Methods

![MailManager class diagram](img/extension-api-mail/mail-manager.png)

### SendEmail(IEnumerable<string> to, string templateName, NameValueCollection replacementTags, IDictionary<string, object> viewData = null)

Sends an email with specified parameters.
`replacementTags` and `viewData` parameters give the ability to manage email content.
`replaceTags` will be inserted at the appropriate positions in the resource file.
If the extension has a custom view for sending email, then the processed template will come with the model.
Data models for partial views should be placed in `viewData`.
`viewData` is not used if an extension does not have a custom view for sending email.

```cs
var replacementTags = new NameValueCollection();
replacementTags.Add("LINK", "example.com");
Api.MailManager.SendEmail(new List<string>() { some@sana-commerce.com }, "FollowEmail", replacementTags)
```


## See also

- [Extension.Api reference](extension-api.md)