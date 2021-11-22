# Simple Content Block Tutorial

Finally it's time to develop the actual add-on. For the sake of simplicity, this tutorial will guide you through creating a simple Content Block Add-on. Not all Add-ons require a Content Block though, but it's a good place to start.

The Content Block Add-on we're going to develop will only render an H1 heading HTML element with the configured text.

### Create a Content Block Model Class

Add a new class to the project called `HeadingContentBlock`,
inherit it from the `ContentBlockModel` class with a `Text` property of string type:

```cs
public class HeadingContentBlock : ContentBlockModel
{
    public string Text { get; set; }
}
```

A content block model class represents the data model which should be specified by user 
in the Sana Admin for a content block on a certain page.
Later this model is rendered in the web store using the entered data.

### Create an Extension Class

Add a new class to the project called `HeadingContentBlockExtension`,
inherit it from the `ContentBlockExtension<HeadingContentBlock>` class and
decorate it with a `ContentBlockIdAttribute`:

```cs
[ContentBlockId("Heading")]
public class HeadingContentBlockExtension : ContentBlockExtension<HeadingContentBlock>
{
}
```

An extension class is needed to tell Sana Commerce, that the add-on is providing a new type of a content block,
whose data model is specified as the generic type argument to the base class.

The `ContentBlockId` attribute is required to assign a unique key to the current content block type,
which is used by Sana Commerce to map the content block ID to the corresponding content block model class.

### Create a UI Component

The last step in implementing this add-on is to create a React UI component,
which is responsible for rendering the previously created `HeadingContentBlock` model in the web store.

First of all, for the best development experience, set up the required structure for the client-side development:
1. Create an empty `ClientApp` folder under the project root. All client-side add-on code must reside under this directory.
1. Create an empty `webstore` folder under the newly created "ClientApp" folder. 
This directory will contain all client-side code related to the web store application. 
There may also be a sibling directory called "admin" for all Sana Admin client-side code, 
but this topic is out of scope of this tutorial.
1. Create a file `jsconfig.json` or `tsconfig.json` based on language you choose (JavaScript or Typescript) under `ClientApp/webstore` folder with the following content:

    ```json
    {
      "compilerOptions": {
        "target": "es6",
        "jsx": "react",
        "moduleResolution": "node",
        "baseUrl": ".",
        "paths": {
          "sana/*": [ "../../../../SDK/Sana.Commerce.WebApp/ClientApp/src/adk/webstore/*" ]
        }
      },
      "include": [
        "./**/*"
      ]
    }
    ```

    This file is needed to provide JavaScript IntelliSense during development.
    Take into account, that this file is web store specific, since it is pointing to the `adk/webstore` folder.
    The corresponding file for the Sana Admin would be exactly the same, but should be pointing to the `adk/admin` folder instead.
    Sana out of the box provides default set of libraries required to build an add-on components, 
    but additional packages could be manually installed using local `package.json`.

Next, create a React component responsible for rendering the model:
1. Create a file `ClientApp/webstore/HeadingBlock.js` with the following content:

    ```js
    import { memo } from 'react';

    const HeadingBlock = ({ model }) => {
      return (
        <h1>{model.text}</h1>
      );
    };

    HeadingBlock.propTypes = {
      model: PropTypes.shape({
        text: PropTypes.string,
      }),
    }

    export default memo(HeadingBlock);
    ```

    This components takes the "model" in its properties and renders the `h1` HTML tag.

1. Create a file `ClientApp/webstore/index.js` with the following content:

    ```js
    import HeadingBlock from './HeadingBlock';

    export const contentBlocks = {
      'Heading': HeadingBlock,
    };
    ```

    This is the entry point of the add-on's web store client-side JS bundle.
    The "contentBlocks" named export has to be an object, 
    where property name ("Heading") is the content block identifier (previously specified in the `[ContentBlockId]` attribute) 
    and the property value is a reference to the corresponding component, responsible for the content block rendering.

## What's next?

Continue with [Packaging your Add-on](packaging.md).