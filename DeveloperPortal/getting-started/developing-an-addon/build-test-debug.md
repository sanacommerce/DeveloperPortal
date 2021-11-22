# Build, Test & Debug your Add-on

## Building your Add-on

The Add-on project has to be built separately, because it is not explicitly referenced by the "Sana.Commerce.WebApp" project. It is also not built automatically when a "Build solution" command is executed in Visual Studio. However, Sana is always watching for any changes to such packages so that when the project is rebuilt, the web store is automatically restarted.

Build your Add-on project.

## Testing your Add-on

Run the solution in Debug mode and wait for Sana to start.

First of all, navigate to the "Upload" tab on the ["Add-ons" page in the Admin](https://support.sana-commerce.com/Content/Sana-Apps/Apps-for-Your-Sana-Web-Store/Sana-Add-ons.htm) to make sure that the new add-on is shown under the "Installed add-ons" section.

The newly developed add-on is automatically loaded by Sana Commerce in a so called "**Development Mode**", since it is located under the "Addons" SDK directory, which is configured to contain add-ons under development. That's also the reason why such add-ons cannot be uninstalled from the Sana Admin.

This approach simplifies the add-on development cycle by avoiding extra steps of assembling the add-on into a real add-on package and re-installing it into the web store.

Since the add-on is already pre-installed, it can be directly tested. Create or edit any flexi-page with a new "Heading" Content Block in the Admin and check how it is rendered in the web store.

## Debugging your Add-on

The client-side JavaScript/TypeScript code is not compiled during the .NET project build but is automatically bundled for development using the `WebpackDevServer` which is run by the "Sana.Commerce.WebApp" project when launched. Make sure that the property `Enabled` in the `WebpackDevServer` section in your current JSON settings file (`appsettings.Development.json` or `appsettings.User.json`) is set to `true`. Any changes to any client-side add-on files are picked up on-the-fly by the WebpackDevServer, which also forces the browser page to reload.

## What's next?

Continue with [packaging your Add-on](packaging.md).