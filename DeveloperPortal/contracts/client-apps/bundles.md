# ClientApp Bundles

In order to hook into Sana's client-side environment, an Add-on is expected to provide a JavaScript bundle per client application (Web store or Admin). Web store and Admin bundles are strictly separate, since they are part of completely different applications. Every Add-on might provide a single Web store client-side bundle, a single bundle for the Admin or both at the same time.

Every bundle must have an entry point, providing exports according to the expected Sana client-side contracts.

> [!WARNING]
> To avoid any confusion, keep in mind that the Webstore and Admin contracts can look very similar in some places, but they are still very different!

By convention, the Webstore add-on bundle is located in the `ClientApp/webstore` folder and the Sana Admin bundle, correspondingly, in the `ClientApp/admin` folder under the add-on's .NET project root.

Also by convention, every bundle entry point must be called `index.js` and be located at the root of the corresponding bundle source directory. Check out the [Create a new Add-on](../../getting-started/develop-an-addon/create-new-addon.md) tutorial for an example.

## Webstore Exports

Here is the list of supported web store named exports, which Sana expects an add-on can provide from its entry JS module:

- `contentBlocks`

    It's an object, whose property names are the content blocks identifiers and property values are instances of the React components, responsible for rendering of the corresponding content block models.
    Refer the code snippet below for an example.

- `reducer`

    Every add-on working in the Sana client-side environment can have its own isolated portion of the Redux state.
    For this purpose, an add-on can export a reducer function, responsible for reducing its state based on the dispatched actions.
    When an add-on contains several loosely related parts, it is recommended to keep their state isolated from each other and use separate reducer functions.
    In this case, an add-on's entry point should export a combined reducer with the help of the standard `combineReducers` Redux function.

- `epic`

    All side effects, like any API calls, are recommended to be handled via `redux-observable` epics. 
    Additionally, an add-on might need a possibility to react to certain events, being happened in the web store, for example, a shopping cart change event.
    In such case, an add-on can provide its own epic to be injected into the Sana environment.
    If an add-on contains multiple epics, they can be just combined with the help of `combineEpics` function from the `redux-observable` module.


Here is an example of an add-on's Web store entry point:

```js
import reducer from './behavior/reducer';
import epic from './behavior/epic';
import SomeContentBlock from './components/SomeContentBlock';

export { reducer, epic };

export const contentBlocks = {
    MyContentBlock: SomeContentBlock,
};
```

In the above example, **"MyContentBlock"** is the content block identifier and "SomeContentBlock" is the React component, responsible for rendering the corresponding content block model in the web store pages.

## Admin Exports

The contract for the Sana Admin add-on exports is the following:

- `contentBlocks`

    This one looks the same as for the web store, but internally it's a different contract.
    It is expected to be an object, whose property names are the implemented content blocks identifiers and property values are objects, containing settings of how this content block should be edited in the Sana Admin.
    These settings consist of two properties: "editor" and "translator".
    Each of these properties should be assigned to the React components, responsible, correspondingly, for editing the content block model or for translating it to another language.
    
    If the "translator" property is omitted, the content block is considered as non-translatable.
    
    If the add-on does not provide any settings for a certain content block or does not provide the Sana Admin client bundle at all, Sana will render a generic form UI for this content block.
    It can be generated for both the "editor" and the "translator" parts, based on the `System.ComponentModel.Annotations` attributes, applied to the content block model .NET class on the server side.
    When some add-on model is a simple class with one-level properties, the generic UI can drammatically reduce the add-on implementation time by skipping the UI for these simple models.
    This "generic UI" approach is applied not only to the content blocks, but also to other model editors in the Sana Admin.
    
    Important to notice, that the "generic UI" feature is available only in Sana Admin and is not supported for any of the web store components.

- `reducer`

    Exactly the same as in the web store contract.

- `epic`

    Exactly the same as in the web store contract.

Here is an example of an add-on's Admin entry point:

```js
import reducer from './behavior/reducer';
import epic from './behavior/epic';
import SomeContentBlockEditor from './components/SomeContentBlock/Editor';
import SomeContentBlockTranslator from './components/SomeContentBlock/Translator';
import OtherContentBlockEditor from './components/OtherContentBlock';

export { reducer, epic };

export const contentBlocks = {
    MyContentBlock: {
        editor: SomeContentBlockEditor,
        translator: SomeContentBlockTranslator,
    },
    MyOtherContentBlock: {
        editor: OtherContentBlockEditor,
    },
};
```