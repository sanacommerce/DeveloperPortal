# Extension.Api.NewsletterManager reference

Every extension in Sana has access to newsletter retrieval functionality via its `Api.NewsletterManager`. This property holds an instance of `NewsletterManager` type which serves as an entry 
point to retrieve newsletter. 

## Methods

![Class diagram](img/extension-api-newsletter/newsletter-manager.png)

### Subscribe(string email)

Subscribes by specified email.

```cs
Api.NewsletterManager.Subscribe("some@sana-commerce.com");
```

### Unsubscribe(string email)

Unsubscribes by specified email.

```cs
Api.NewsletterManager.Unsubscribe("some@sana-commerce.com");
```

## See also

- [Extension.Api reference](extension-api.md)