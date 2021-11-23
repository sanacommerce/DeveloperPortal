# Add-on Development Kit (ADK)

The **Sana Add-on Development Kit** (abbr. **Sana ADK**) is a set of libraries and APIs, specifically designed for the development of Sana Add-ons.

The Sana ADK is currently still part of the bigger Sana Commerce SDK and consists of:

- Sana.Extensions — a server-side library, providing backward-compatible contracts for interoperability between Add-ons and the core product
- Reusable client-side React components, libraries and APIs
- A set of Tools for streamlined Add-on development, testing and packaging

Whereas the full Sana Commerce SDK is targeting customized Sana projects and will change with every new version of Sana Commerce, the Sana ADK is an **exhaustive** set of core product APIs and components, which are allowed to be used by the add-ons and are guaranteed to be backward-compatible in the future product releases.

## Tooling

As it is described in the [Simple Content Block Tutorial](../developing-an-addon/simple-cb-tutorial.md), every add-on project references the same `Scripts/Addons/msbuild.targets` file, which centralizes and automates common workflows of add-on development.

For example, it automatically copies the add-on output assemblies into the root of the "bin" directory to be correctly picked up by the Sana web application at startup.

Additionally, it overrides the "Publish" MSBuild target to build the production-ready add-on client-side bundle, as well as collect all required files and package them into a "*.sanapkg" file format.
So that, in order to assemble a package out of an add-on source project, just run `dotnet publish "<path_to_addon_project>" -c Release -o "<output_dir>"` in the command line.
As a result, the assembled "*.sanapkg" file is created under the "output_dir" folder.

Read more about the exact steps of the corresponding workflows in the [Developing an Add-on](../developing-an-addon/technology-stack.md) section.
