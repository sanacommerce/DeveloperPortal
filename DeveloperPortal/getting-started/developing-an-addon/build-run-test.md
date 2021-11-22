# Build, Run & Test your Add-on

Build your Add-on project and run the web store in Debug mode.

> [!Note]
> The add-on project has to be built separately, because it is not explicitly referenced by the "Sana.Commerce.WebApp" project.<br />
> It is also not built automatically when a "Build solution" command is executed in Visual Studio.<br />
> But, Sana is always watching for any changes to such packages, so that when the project is rebuilt, the web store is automatically restarted.

> [!Note]
> The client-side JavaScript code is not compiled during the .NET project build, but is automatically bundled for development using the `WebpackDevServer`, 
> which is run by the "Sana.Commerce.WebApp" project when launched. Make sure that in `WebpackDevServer` section in your current JSON settings file 
> (`appsettings.Development.json` or `appsettings.User.json`) property `Enabled` is set to `true`.
> Any changes to any client-side add-on files are picked up on-the-fly by the WebpackDevServer, which also forces the browser page to reload.

First of all, navigate to the "**Upload add-ons**" page in Sana Admin to make sure that the new add-on is shown under the "Installed add-ons" section.

The newly developed add-on is automatically loaded by Sana Commerce in a, so called, "**Development Mode**", 
since it is located under the "Addons" SDK directory, which is configured to contain add-ons under development.
That's also the reason why such add-ons cannot be uninstalled from the Sana Admin.

This approach simplifies the add-on development cycle by avoiding extra steps of assembling the add-on into a real add-on package and re-installing it into the web store.

Since the add-on is already pre-installed, it can be directly tested.
Create any flexi-page with a new "Heading" content block in Sana Admin and check how it is rendered in the web store.