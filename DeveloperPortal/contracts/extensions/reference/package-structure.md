# The structure of extension package

The Extension package structure is based on the structure of NuGet package.

Basically it is a zip archive with specific format ([PackageId].[PackageVersion].sanapkg).
  > [!Important]
  > _SanaPackageInfo/metadata/type_ node with **Extension** value is required in ['Sanamanifest.xml'](../../Design/DesignPacks/Structure.md#sanamanifestxml)

## Package contents

- _sanamanifest.xml_: file contains package metadata (id, version, description, authors).
- _/themes_: the folder with one ore more theme files. After extension package installed these themes will appear in the Admin (_Design/Themes_)
- _/bin_: the folder which includes DLL files to be loaded into Sana. It includes extension itself and also could include additional libraries.
- _/adminresources_: contains RESX files which will be applied for the Admin.
- _/sanatexts_: contains RESX files to be applied for the webstore.
- _/spa_ or _/ClientApp_ (for development package): contains client application files.
  - _/admin_: contains extension client application files for admin.
    - _/admin/index.js_: contains exported from extension `epic`, `reducer` and editor components for `contentBlocks`, extension `configuration`, `paymentModules` and `shippingModules`.
  - _/webstore_: contains extension client application files for webstore.
    - _/webstore/index.js_: contains exported from extension `epic`, `reducer` and components for `contentBlocks` and `paymentModules`.