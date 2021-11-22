# JavaScript APIs

On the client-side, there is a strict separation between the Web store ClientApp and the Admin ClientApp. There are two separate sets of APIs for the Web store and Admin and all of them are located in the SDK under the `SDK/Sana.Commerce.WebApp/ClientApp/src/adk` directory.
The "adk" directory has the `webstore` and the `admin` subfolders, respectively, for the Web store and the Admin APIs.

## Reusable Libraries

All reusable libraries can be found in the `_libraries.json` file.

This file provides the list of all shared NPM packages, which can be used by add-ons and are not included into the add-ons own bundles.
The instances of these packages are provided by Sana at runtime, eliminating the overhead of the multiple instances of the same library included into different bundles.
All other NPM packages, which are used in the add-on, are embedded into the add-on's own JS bundle.

## Reusable Modules

All `*.js` and `*.ts` files

These are the JavaScript modules, specifically provided by Sana to be used in the add-ons.
Everything exported from any of these files, can be imported into any add-on JS file using the following import statement format:
    
```js
import { SomeComponent, OtherComponent, useSomeHook } from 'sana/<module>';
```

When the add-on bundle is assembled by the Webpack, it resolves all imports starting with the `sana/` prefix into the corresponding file in this directory matching the specified `<module>` name.