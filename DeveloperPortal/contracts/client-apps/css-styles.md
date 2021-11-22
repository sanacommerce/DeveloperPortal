# Reusable CSS Styles

There are two separate sets of reusable Sass Variables for the Web store and Admin and all of them are located in the SDK under the `SDK/Sana.Commerce.WebApp/ClientApp/src/adk` directory.
The "adk" directory has the `webstore` and the `admin` subfolders, respectively, for the Web store and the Admin SASS files.

## Sass Variables

All `*.scss` files are providing common Sass variables, which can be used in the add-ons.
One example of such file is the `adk/webstore/theme.scss`, which provides variables for miscellaneous font sizes, families, colors etc.
When used in an add-on, the configured value for this variable is injected into the add-on's stylesheets at runtime.