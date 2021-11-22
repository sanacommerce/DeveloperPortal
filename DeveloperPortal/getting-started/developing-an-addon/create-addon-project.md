# Create an Add-on Project

Before writing any code, a new project for the future add-on has to be added to the Sana Commerce SDK solution.

## Add New Project

In Visual Studio, add a new Class Library project under the "Addons" solution folder, targeting `.NET Core 3.1`
or appropriate .NET version Extension API is compatible with and specify its location to point to the "Addons" folder under the SDK root directory. The name might be `Sana.Extensions.HeadingContentBlock`.

> [!Note]
> It is very important to place a new project into the "Addons" directory under the SDK root, because all projects under this location are treated by Sana in a special way, which is explained later in this article.

## Configure Add-on Project

Second, add the following `Import` statement to the project file:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>
  <Import Project="$(MSBuildProjectDirectory)\..\..\Scripts\Addons\msbuild.targets" />
</Project>
```

Doing this will automatically add the reference to the [`Sana Extension Framework`](/contracts/extensions/index.md) library and all other required NuGet packages, like `System.ComponentModel.Annotations`.
This will ensure, that an add-on is using the same NuGet packages versions, as the Extension Framework itself.

### Add Package Metadata

The next step is to add the obligatory package manifest file, which contains the add-on package metadata.

To do that, add a new XML file named `sanamanifest.xml` to the root of the add-on project with the following contents:

```xml
<SanaPackageInfo>
  <metadata>
    <id>HeadingContentBlock</id>
    <version>1.0.0</version>
    <title>Heading content block</title>
    <description>Content block which allows creating heading content elements.</description>
    <authors>Sana Commerce</authors>
    <type>Extension</type>
    <minSanaVersion>1.0.0</minSanaVersion>
  </metadata>
</SanaPackageInfo>
```

## What's next?

Continue with [creating your first simple Content Block Add-on](simple-cb-tutorial.md).