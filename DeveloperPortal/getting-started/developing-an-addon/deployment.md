# Deploying your Add-on to a Sana web store

## Smoke Testing your Add-on

After your Add-on package is assembled, it is highly recommended to perform at least few smoke tests against the manually uploaded Add-on package.

In order to test it using the your local SDK solution, **temporarily** remove the `Paths:Packages:DevelopmentDirectory` application setting in the `appsettings.Development.config` file under the "Sana.Commerce.WebApp" project.
Otherwise, when trying to upload the assembled package into a running web store, Sana will respond with an error that the package with the same identifier is already installed.

Now start the web store from Visual Studio, navigate to the "Upload" tab on the ["Add-ons" page in Sana Admin](https://support.sana-commerce.com/Content/Sana-Apps/Apps-for-Your-Sana-Web-Store/Sana-Add-ons.htm), upload the assembled add-on package and perform the some smoke tests to verify your Add-on is working correctly.

> [!WARNING]
> Don't forget to restore the `Paths:Packages:DevelopmentDirectory` application setting in the `appsettings.Development.config` file when you want to switch back to developing/debugging the Add-on.

## Deployment

Deploying your Add-on to your customer(s) is done in the same way as shown in the smoke testing step above. Instead of uploading the package to your local development environment's Admin, you either log into your customer's Sana Admin yourself and upload the Add-on there or simply share the Add-on package with your customer directly.

## What's next?

Topics such as the client-side state management, GraphQL API usage, reusing core Sana components etc. are explained in the [Content Block Tutorial](../../customize/tutorials/content-block.md).