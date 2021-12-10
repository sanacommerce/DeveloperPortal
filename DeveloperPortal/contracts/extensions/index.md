# Extensions

Extensions are the core assets of developing all Sana Add-ons which reside on the server-side of the application. Without it, an Add-on can do nothing.

Practically, it is represented by just a single .NET library called `Sana.Extensions.dll`.
This library contains all contracts which an add-on can implement and an exhaustive list of core APIs which add-ons can use.

Through this library, Sana provides a set of **Extension Points** for extending the core functionality of the product.
An add-on hooks into an extension point by implementing one of the predefined abstract "...Extension" classes, for example the `ContentBlockExtension<TModel>` class.

All implemented Extensions will be automatically discovered by the Sana Core Framework from an add-on's .dll output library.