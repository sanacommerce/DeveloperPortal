# Content Block Tutorial

## Requirements

The goal of this tutorial is to create an advanced content block add-on, which will cover the following topics of add-on development:
- Add-on Redux state
- Epics for side effect handling
- Invoking Sana GraphQL API
- CSS Styling
- Using the resource texts in Sana Admin
- Using "Sana texts" in the web store
- Reusing shared Sana components and React Hooks
- Adding icon

As an example add-on, covering the above features, let's build a "Latest News" content block add-on, which will:
- Show the latest N news items in the web store, where "N" will be specified by the user in Sana Admin
- The layout of the content block will be made responsive to the screen size
- News items text color will be taken from the current web store theme, configured in Sana Admin
- The content block editor in Sana Admin will be improved for better UX by providing a predefined list of recomended items counts (e.g. "4", "6" or "8")
- For SEO purposes, the content block will be fully rendered on the server-side during an initial page load
- The news items should be reloaded when the user changes the web store language

The order of the add-on implementation steps is not the same as the order of the above requirements.
Instead, an add-on is implemented by incrementally adding functionality on top of what has already been built.

## Preparation

Set up a new [SDK development environment](../../getting-started/developing-an-addon/environment-setup.md) and create a minimal Add-on project as explained in [Create a new Add-on Project](../../getting-started/developing-an-addon/create-addon-project.md) step.

Make sure that "sanamanifest.xml" file is present at the root of the project.

## Content Block Extension

The very first step in any add-on development is creating an extension class.

Create a class `LatestNewsModel.cs` anywhere in the project with the following content:

```cs
public class LatestNewsModel : ContentBlockModel
{
}
```

For now, the model class is empty, because we don't need any settings to be specified in Sana Admin yet.
This functionality will be added later.

Now create a class `LatestNewsExtension.cs` with the following content:

```cs
[ContentBlockId("LatestNews")]
public class LatestNewsExtension : ContentBlockExtension<LatestNewsModel>
{
}
```

The extension has been implemented, but it will not work yet, because there is no user interface yet implemented for it in the web store.

## Web Store User Interface

The content block web store user interface is represented by a single React component, which accepts the content block model in the corresponding component property.
In this step, such component is going to be created.

> [!Note]
> Refer to the [Create a UI Component](/getting-started/developing-an-addon/simple-cb-tutorial.html#create-a-ui-component) step of the Simple Content Block Tutorial for creating the required folder structure and adding support for JS IntelliSense in the editor through either a `jsconfig.json` or `tsconfig.json` file.

Since news loading is not yet implemented, the initial version of the component will just render some stub data, but with respect to the real structure of the news items.

Create a file `ClientApp/webstore/components/LatestNewsBlock.js` with the following content:

```js
import React from 'react';

const items = [
  { id: '1', date: Date.now(), title: 'News item 1', url: '#' },
  { id: '2', date: Date.now(), title: 'News item 2', url: '#' },
  { id: '3', date: Date.now(), title: 'News item 3', url: '#' },
  { id: '4', date: Date.now(), title: 'News item 4', url: '#' },
];

const LatestNewsBlock = props => {
  return (
    <>
      <h3>Latest news</h3>
      <ul>
        {items && items.map(item => (
          <li key={item.id}>
            <a href={item.url}>{item.title}</a>
            <div>{item.date}</div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default React.memo(LatestNewsBlock);
```

For now, the news item date will be rendered as is, but will be nicely formatted later in this tutorial.

> [!Note]
> Let's agree, that all UI components will reside under the "components" subfolder,
> because later we will also have to add some behavioral logic to the add-on,
> which is planned to be put into a sibling "behavior" directory to enforce better separation of concerns.
>
> It is also recommended to add a "Block" suffix to the name of the component ("LatestNewsBlock" instead of "LatestNews"), 
> because quite frequently it is convenient to extract some part out of this component into a sub-component. 
> Adding the "Block" suffix makes it clear, that it is the component for the entire content block and not just the list of news items.

The next step is to export this component, so that Sana knows what to use to render the UI for the corresponding content block.

Create a file `ClientApp/webstore/index.js` with the following content:

```js
import LatestNewsBlock from './components/LatestNewsBlock';

export const contentBlocks = {
  'LatestNews': LatestNewsBlock,
};
```

Now run the web store, open Sana Admin, add the "LatestNews" content block to some flexi-page and ensure, that everything works correctly.

## Component Look & Feel

The current React component renders only the plain HTML without the proper CSS styling.

General HTML elements, like the content block header `h3` tag, are already styled globally, but the list of news items still has to be adjusted.

### Component Stylesheet

As the first step, let's create a separate stylesheet for the content block component.

Create a file `ClientApp/webstore/components/LatestNewsBlock.module.scss` with the following content:

```scss
@use 'sana/theme.scss' as theme;

.list {
    list-style-type: none;
    padding: 0;

    a {
        color: theme.$regularTitle_FontColor;
        font-weight: bold;
    }
}

.date {
    color: theme.$lighterText_FontColor;
}
```

Since the created file is a **modular** stylesheet, all contained CSS classes can be named in a short form, 
because they are automatically transformed into unique names to avoid naming conflicts between different add-ons and core product itself. 

> [!Note]
> Non-modular stylesheet files are also supported, but should be used only in rare cases, 
> for example, when some common widget is wrapped in a React component and its predefined styles have to be copy-pasted as is.
> But even in this case, always make sure, that all such CSS classes are correctly prefixed to avoid unexpected strange styling behavior on the frontend.

The `@use` directive at the first line is importing Sana web store theme variables into a `theme` alias to make them available in the current stylesheet.
All exported Sana theme variables can be found in `Sana.Commerce.WebApp/ClientApp/src/adk/webstore/theme.scss` file, which is a part of the client-side [Sana ADK](../../getting-started/introduction/adk.md).

Sana also supports raw CSS files in addition to SCSS, but only when using SCSS, it is possible to use predefined theme variables, like those in the above code snippet.

> [!Warning]
> Never apply any styling to global HTML elements, since it will have an impact on the whole page and may result in a overall broken look & feel of the web store.
> 
> Bad example: `h1 { color: Red; }`<br />
> Good example: `.my-block h1 { color: Red; }`

Now let's use the newly created styles in the React component.

All CSS or SCSS modules are imported into React components using the same `import` statement as the regular JS modules:

```js
import styles from './LatestNewsBlock.module.scss';
```

The imported `styles` object contains properties of the same names as all CSS classes, defined in the stylesheet file.
These properties should be passed to the `className` attributes of the corresponding React elements, so that the entire component definition looks like this:

```js
const LatestNewsBlock = props => {
  return (
    <>
      <h3>Latest news</h3>
      <ul className={styles.list}>
        {items && items.map(item => (
          <li key={item.id}>
            <a href={item.url}>{item.title}</a>
            <div className={styles.date}>{item.date}</div>
          </li>
        ))}
      </ul>
    </>
  );
};
```

Notice the usage of `styles.list` and `styles.date` propeties.
At runtime, these elements will be assigned the corresponding transformed class names.

> [!Note]
> Under the hood, Sana is using an approach, similar to the [isomorphic-style-loader](https://github.com/kriasoft/isomorphic-style-loader) library, 
> but without a requirement to explicitly wrap the exported component with any [HOC](https://reactjs.org/docs/higher-order-components.html) wrappers.
> This wrapping is done automatically with the help of an additional Sana Webpack plugin.

Next, let's make the responsive layout of the news items list to be adjustable for different screen sizes.

### 12-Column Grid Layout

Out of the box, Sana provides two approaches to implement responsive layouts.

One of them is a set of React components for reusing the standard 12-column grid layout in the add-ons.

Let's change the React component markup to render list items in two equal columns on medium and bigger screens and in one column on smaller screens.

First of all, import the required grid components from the Sana ADK:

```js
import { Row, Col } from 'sana/elements';
```

> [!Tip]
> Check the corresponding `adk/webstore/elements.js` file for the list of all provided components.

Next, change the component to render the following:

```js
const LatestNewsBlock = props => {
  return (
    <>
      <h3>Latest news</h3>
      <Row as="ul" className={styles.list}>
        {items && items.map(item => (
          <Col as="li" key={item.id} md={6}>
            <a href={item.url}>{item.title}</a>
            <div className={styles.date}>{item.date}</div>
          </Col>
        ))}
      </Row>
    </>
  );
};
```

So, instead of the plain `ul` tag, now it renders a `Row` component, represented by an `ul` HTML tag, which additionally applies the special grid-related styling to this element.

Instead of an `li` element, it now renders the `Col` component, 
represented by an `li` HTML tag and configures each column to occupy 6 out of total of 12 columns on all screens at least of a medium size (notice the `md={6}` attribute).

The following screen sizes, represented by the corresponding properties of the `Col` component, are currently supported:
- **xs** - Extra small
- **sm** - Small
- **md** - Medium
- **lg** - Large
- **xl** - Extra large

### Media Queries

Another approach to add responsiveness to the component layout is by using the media queries in SCSS files.

Let's make the news item date float right on large and extra large screens.
To do this, add the following to the `LatestNewsBlock.module.scss`:

```scss
@media (min-width: #{theme.$breakpoints_Large}px) {
    .date {
        float: right;
    }
}
```

Notice the use of the `$breakpoints_Large` SASS variable in the media query.
The values of all screen breakpoints are also provided as part of the current Sana theme.

## Connect to Redux State

Now let's extract the stub news items collection out of the React component into a Redux state.
This is basically an intermediate step before fetching the real data via the GraphQL API.

As it is described in the [Sana ADK article](../../getting-started/introduction/adk.md), every add-on is dedicated an isolated portion of the global Redux state, which it can work with.
And that's, actually, the only difference.
All other aspects of working with Redux and its React integration are exactly the same as descibed in their official tutorials.
 
First of all, let's create the add-on state structure, the most basic redux actions and the reducer function.

So, create a file `ClientApp/webstore/behavior/actions.js` with the following content:

```js
export const NEWS_REQUESTED = 'NEWS/REQUESTED';

export function requestNews(count) {
  return {
    type: NEWS_REQUESTED,
    payload: { count },
  };
}

export const NEWS_LOADED = 'NEWS/LOADED';

export function newsLoaded(items, requestedCount) {
  return {
    type: NEWS_LOADED,
    payload: { items, requestedCount },
  };
}
```

For now, the second action will not be used, but it will be definitely needed later.

Then, create a reducer file at `ClientApp/webstore/behavior/reducer.js` with the following content:

```js
import { NEWS_REQUESTED } from './actions';

const stubItems = [
  { id: '1', date: Date.now(), title: 'News item 1', url: '#' },
  { id: '2', date: Date.now(), title: 'News item 2', url: '#' },
  { id: '3', date: Date.now(), title: 'News item 3', url: '#' },
  { id: '4', date: Date.now(), title: 'News item 4', url: '#' },
];

const initialState = {
  items: undefined,
  loadedCount: 0,
};

export default function reducer(state = initialState, action) {
  if (action.type === NEWS_REQUESTED) {
    return {
      items: stubItems,
      loadedCount: action.payload.count,
    };
  }
  return state;
}
```

For now, the reducer will just initialize the list of news items with the test data, when requested.
A little later, this code will be changed as well.

The "loadedCount" property is used to store the count of initially requested news items, which might be bigger, 
than the size of the `items` array (in case when there are not so many news items yet in the database).
This will be needed later to prevent React component continuously requesting more items, if there are not enough news items in the database.

Next, change the React component to get the list of items from the Redux state and, if not loaded yet, dispatch a `NEWS_REQUESTED` action.
The resulting `LatestNewsBlock.js` file should look like this:

```js
import styles from './LatestNewsBlock.module.scss';
import React, { useEffect } from 'react';
import { Row, Col } from 'sana/elements';
import { useSelector, useDispatch } from 'react-redux';
import { requestNews } from 'behavior/actions';

const LatestNewsBlock = props => {
  const dispatch = useDispatch();
  const { items, loadedCount } = useSelector(state => state);

  useEffect(() => {
    if (loadedCount < 4)
      dispatch(requestNews(4));
  }, [loadedCount]);

  return (
    <>
      <h3>Latest news</h3>
      <Row as="ul" className={styles.list}>
        {items && items.map(item => (
          <Col as="li" key={item.id} md={6}>
            <a href={item.url}>{item.title}</a>
            <div className={styles.date}>{item.date}</div>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default React.memo(LatestNewsBlock);
```

In this example, the component is using the `useSelector` and `useDispatch` hooks from the `react-redux` library, but the HOC `connect()` approach is also supported.
So, it's, basically, up to personal preference or established best practices, which approach to use.

Also notice, how the `requestNews` action creator is imported into the current file.
Instead of specifying path traversals, it is using an absolute import path `behavior/actions`.
This is possible, because out of the box, Sana provides several preconfigured [Webpack resolution aliases](https://webpack.js.org/configuration/resolve/#resolvealias) 
and 'behavior' folder alias is one of them.

> [!Tip]
> For the full list of supported aliases, check the `ClientApp/config/webpack/add-on.config.js` file under the `Sana.Commerce.WebApp` project.

And the last step in Redux state configuration is to export the reducer from the add-on entry point.
The resulting `index.js` file should look like this:

```js
import reducer from './behavior/reducer';
import LatestNewsBlock from './components/LatestNewsBlock';

export { reducer };

export const contentBlocks = {
  'LatestNews': LatestNewsBlock,
};
```

Now, run the web store and check, that everythings works without any errors.

## Invoke GraphQL API

The next step is to fetch the real data via Sana GraphQL API, instead of rendering the stub news items.

First of all, it is needed to define a GraphQL query, which will be sent to the API endpoint.
The web store GraphQL endpoint is located at the following URL path: `/api/graph` and supports the [GraphQL Introspection](https://graphql.org/learn/introspection/) query, 
which can be used to explore the entire API.

It is very convenient to use, for example, the [Altair GraphQL Client](https://altair.sirmuel.design/) to explore and invoke the API.

For retrieving the latest news items, put the following query into the new file `ClientApp/webstore/behavior/queries.js`:

```js
export const latestNewsQuery = `
query ($count: Int!){
  news{
    list(page:{index: 0, size: $count}){
      items{
        id
        date
        title
        url
      }
    }
  }
}`;
```

Here `$count` is a query argument, which can be specified from the outside to parameterize the query.

Since all side effects, like API calls, are recommended to be encapsulated in `redux-observable` epics, let's create the corresponding epic.

> [!Note]
> The knowledge of [reactive epics](https://redux-observable.js.org/) is required to proceed with this tutorial.
> Also get acquainted with [RxJS library](http://reactivex.io/rxjs/), which epics are built on top of.

Create a file `ClientApp/webstore/behavior/epic.js` with the following content:

```js
import { ofType } from 'redux-observable';
import { mergeMap, map } from 'rxjs/operators';
import { NEWS_REQUESTED, newsLoaded } from './actions';
import { latestNewsQuery } from './queries';

const epic = (action$, _state$, { api }) => action$.pipe(
  ofType(NEWS_REQUESTED),
  mergeMap(action => api.graphApi(latestNewsQuery, { count: action.payload.count }).pipe(
    map(data => newsLoaded(data.news, action.payload.count)),
  )),
);

export default epic;
```

The above epic does the following:
1. Listens only to the `NEWS_REQUESTED` action
1. For every action, sends a GraphQL query to fetch the latest news (more on this later)
1. Wraps every response together with the initially requested items count into the `NEWS_LOADED` action
1. The `mergeMap` operator will merge the results of all concurrent API responses into a single output action stream

In general, any epic is a function with 3 parameters:
- `action$` - a reactive stream of actions
- `state$` - a reactive stream of states
- `dependencies` - an object, containing all provided services, which can be used in epics

One of those services is called `api`, which provides reactive functions for making network requests.
The `api.graphApi(query, args, retries)` function invokes the Sana GraphQL endpoint with automatically included request authentication token, if any exists.

The first argument to the `graphApi` function is a GraphQL query, the second is an object with all required query arguments 
and the third one is the number of retries of the request if it transciently fails (by default, it retries 3 times).

> [!Note]
> The error handling topic is out of scope of this tutorial.

The last parts of connecting the real API response data with other pieces is to change the reducer to correctly update the Redux state 
and to not forget to export the epic from the add-on entry point module.

After adjustments, the reducer file should look like this:

```js
import { NEWS_LOADED } from './actions';

const initialState = {
  items: undefined,
  loadedCount: 0,
};

export default function reducer(state = initialState, action) {
  if (action.type === NEWS_LOADED) {
    const { items, requestedCount } = action.payload;
    if (requestedCount > state.loadedCount)
      return { items, loadedCount: requestedCount };
  }
  return state;
}
```

The reducer updates the state only in the case, when more items have arrived, than is already stored in the state.
Such behavior is needed to always keep the maximum available news items, which might be needed by any instance of the content block.

At last, export the newly created epic from the `index.js` entry module:

```js
import LatestNewsBlock from './components/LatestNewsBlock';
import reducer from './behavior/reducer';
import epic from './behavior/epic';

export { reducer, epic };

export const contentBlocks = {
  'LatestNews': LatestNewsBlock,
};
```

Now, run and test the add-on in the web store.

## Linking Other Pages

In general, it works as expected, but there is still a small issue — when the news item link is clicked, the news item page is opened, but the whole browser window is reloaded.

The reason of such behavior is that the current component is using a raw `a` tag with `href` attribute, which is handled in a default browser way.

In order to perform the navigation within the application without reloading the whole window and resetting the state, a `Link` component, supplied by the ADK, should be used instead.
This component accepts two properties to perform correct navigation:
1. `url` - the URL of the target page
1. `to` - the destination route data, containing the type of the target page and additional page arguments

The news item page URL is already retrieved through the API and the route data can be constructed with the help of the corresponding functions from the `sana/routes` ADK module.

Here are the adjustments, which should be made to a component:

```js
import { Row, Col, Link } from 'sana/elements';
import { newsItemPage } from 'sana/routes';

const LatestNewsBlock = props => {
  // ...
    <Col as="li" key={item.id} md={6}>
      <Link url={item.url} to={newsItemPage(item.id)}>{item.title}</Link>
      <div className={styles.date}>{item.date}</div>
    </Col>
  // ...
};
```

Now the navigation to the news item details page happens immediately and does not send any extra network requests.

## Date Formatting

At the current moment, the news item date is just rendered as is in a completely unreadable format.
Since date/time formatting is a complicated topic, Sana ADK provides several components out of the box, 
which can render these values in a correctly formatted way, according to the currently selected web store language.

Import the `DateDisplay` component from the `sana/elements` module and use it to display the news item date in a formatted way:

Here are the adjustments, which should be made to a component:

```js
import { Row, Col, Link, DateDisplay } from 'sana/elements';

const LatestNewsBlock = props => {
  // ...
    <Col as="li" key={item.id} md={6}>
      <Link url={item.url} to={newsItemPage(item.id)}>{item.title}</Link>
      <div className={styles.date}><DateDisplay value={item.date} /></div>
    </Col>
  // ...
};
```

The `value` property of this component can accept date in almost any format: a string, a number or an instance of Date class.

## Use Sana Texts

In this step, let's add an extra link to the content block, which will lead to a news overview page and the link text will be represented by a "Sana text", 
so that it is editable by the admin users and translatable to other languages.

To accomplish this goal, the following ADK bits have to be imported:
- A `newsPage` route builder function to provide the news overview page route data
- A `SimpleText` component to render the manageable "Sana text"

Here is the modified React component source code (some parts are removed for brevity):

```js
// ...
import { newsItemPage, newsPage } from 'sana/routes';
import { SimpleText } from 'sana/texts';

const LatestNewsBlock = ({ model }) => {
  // ...
  return (
    <>
      <h3>Latest news</h3>
      <Row as="ul" className={styles.list}>
        {/*...*/}
      </Row>
      <p>
        <Link to={newsPage()}>
          <SimpleText textKey="ViewAllNewsButtonText" />
        </Link>
      </p>
    </>
  );
};
```

Unfortunately, the link is not shown yet on the page, because the "Sana text" with the specified key does not exist yet and an empty link without any text is rendered.

Instead of hard-coding any fallback value, it is recommended to specify the default text in the resource file.

Create a file `SanaTexts/SanaTexts.resx` under the add-on project root and add a single text there with the key "**ViewAllNewsButtonText**" and the value "View all news".
Make sure, that the text key in the resource file matches the text key passed to the `SimpleText` component.

## Server-Side Rendering (SSR)

Before making the content block configurable, there is still one small adjustment, which has to be done to the web store component — 
support server-side rendering to make the content block content indexed by the search engines.

The majority of things related to SEO and SSR are handled by Sana automatically, 
but there are few requirements for an add-on to be correctly supported as well.

### Data Loading

The core difference between browser and server rendering process is that on the server, the application is rendered to a string and not to a DOM tree.
It also means, that there is no lifetime of React components, when rendered on the server.
And since there is no lifetime, the React Effect hooks are not invoked as well.

React's `useEffect` hook is frequently used to request some data to be loaded from the API, 
like dispatching the `NEWS_REQUESTED` action is the current add-on case.

Specifically for this use case, there is a special replacement hook, provided by the Sana ADK, which is also invoked during SSR.
This hook is called `useLoadEffect` and can be imported from the `sana/utils` ADK module.

In the browser, this effect behaves exactly in the same way as standard `useEffect` hook, but it is also invoked on the server right after the React's virtual DOM is rendered to a string.

> [!Tip]
> The rule of thumb is the following:
> - Choose `useLoadEffect` when the data being requested is also required for SEO purposes, so have to be rendered on the server
> - Choose `useEffect` in all other cases

So, the only changes needed are:
1. Import `useLoadEffect` from `sana/utils`
1. Replace standard `useEffect` with `useLoadEffect`

The brief overview of the resulting code is here:

```js
import React from 'react';
import { useLoadEffect } from 'sana/utils';
// ...

const LatestNewsBlock = ({ model }) => {
  // ...
  useLoadEffect(() => {
    if (loadedCount < 4)
      dispatch(requestNews(4));
  }, [loadedCount]);
  // ...
};
```

In order to check, that it works, do the following:
1. Set the application setting `Spa:ServerRendering:Enabled` to "**true**" in the `appsettings.Development.json` file
1. Start the application
1. Navigate to the corresponding web store page in the browser
1. Open the source code of the page
1. Make sure, that the add-on content block is pre-rendered into the initial HTML document, returned by the server

### Visual Designer mode

In some cases it is necessary for addon developers to have a possibility to determine whether content block is currently used in Visual Designer mode.
Sometimes it is needed to skip heavy operations or render component in a different way in Visual Designer.
For such situations Sana provides system boolean property `isDesignerMode`. 
This property can be used to skip server data loading or to show component differently in Visual Designer.

```js
const LatestNewsBlock = ({ model, isDesignerMode }) => {
  // ...
  useLoadEffect(() => {
    // skip real data loading in designer mode
    if (isDesignerMode)
      return;

    // request data from server here
  }, [loadedCount]);
  
  if (isDesignerMode) {
    // show stub data in designer mode
    return (
    <>
      <h3>Latest news</h3>
      <ul>
          <li>
            <a href='#'>news item 1</a>
            <a href='#'>news item 2</a>
            <a href='#'>news item 3</a>
          </li>
        ))}
      </ul>
    </>  
  }
  // render real data here
};
```

### Serializable Redux State

Another requirement for the SSR compatibility is to not store any custom object types or functions in the Redux state.

The reason for it, is that after the web page is rendered on the server, the whole Redux state is serialized into JSON format and transferred to the browser, 
where it is deserialized and connected to the pre-rendered DOM.

Even the standard JavaScript `Date` instances should not be used, because the "Date" type is not supported in JSON.
To overcome this issue, just choose one of the JSON-compatible value types, like a number or a string.

### Avoid Browser-Specific APIs

The last requirement is to be careful with the browser-specific APIs, which are not available in the NodeJS environment.

For example, the `localStorage` API is available only during the browser-side rendering. 

## Handle App Events

Since the news items GraphQL API returns the data localized to the currently selected language,
when the user switches the language in the web store, the news items should be reloaded as well.

This goal can be achieved by reacting to a special kind of Redux actions called "events".

The event actions are global and are cycling in the Redux loop through both the core application and the add-ons.
It means, that when the core application dispatches an event, it is also seen by all add-ons,
and when an add-on dispatches some event, it is also seen by the core application and other add-ons as well.

The list of available events with the corresponding constants are provided through the `sana/events` ADK module.

So, in order to invalidate the current news items when the user switches the language, adjust the add-on reducer in the following way:

```js
import { NEWS_LOADED } from './actions';
import { LANGUAGE_CHANGED } from 'sana/events';

const initialState = {
  items: undefined,
  loadedCount: 0,
};

export default function reducer(state = initialState, action) {
  if (action.type === NEWS_LOADED) {
    const { items, requestedCount } = action.payload;
    if (requestedCount > state.loadedCount)
      return { items, loadedCount: requestedCount };
  }
  else if (action.type === LANGUAGE_CHANGED) {
    return initialState;
  }
  return state;
}
```

Now launch the web store, change the current language and check, that the news items are successfully reloaded.

## Configurable Content Block

The content block is already fully functional, but in most of the cases, a content block also has some configuration options, which influence its behavior in the web store.

This section of the tutorial will cover the easiest way to add these configration options, so that they can be specified by the admin user, 
and after that, demonstrate how to provide a fully custom user interface for the content block editor and translator in the Sana Admin.

### Add Model Properties

Let's add the following content block settings:
1. The content block title text
1. Configure the number of news items to be shown
1. A setting to show or hide the link to the all news page

To do this, add the following properties to the `LatestNewsModel` class:

```cs
public class LatestNewsModel : ContentBlockModel
{
    [Display(Name = "BlockTitle")]
    [Localizable(true)]
    [StringLength(250, ErrorMessage = "BlockTitle_MaxLengthError")]
    public string Title { get; set; }

    [Display(Name = "ItemsCount")]
    [Required(ErrorMessage = "ItemsCount_RequiredError")]
    public int ItemsCount { get; set; }

    [Display(Name = "ViewAllLink")]
    [UIHint("ShowHide")]
    public bool ShowViewAll { get; set; }
}
```

Now, build the add-on project explicitly and open Sana Admin to check that the settings can be specified by the user and the "Title" property can be translated to a different language.

> [!Tip]
> Based on the property type, the `DataTypeAttribute` and the `UIHintAttribute`, Sana chooses which type of the field editor should be used.
>
> All supported field editor types, used in the generic form UI, can be discovered using the 
> `ClientApp/src/admin/components/forms/addons/generic/GenericFormField.js` file under the `Sana.Commerce.WebApp` project.

### Add Resource Texts

The settings are manageable, but the labels and error messages are not readable yet.
Also the content block name in Sana Admin is in "PascalCase" format ("LatestNews"), which can be improved as well.
Let's create Sana Admin resources file with the corresponding texts in it.

Create a file `AdminResources/Admin.resx` under the add-on project root with the following texts:
| Key | Value |
| --- | ----- |
| ContentBlock_LatestNews | Latest news |
| BlockTitle | Block title |
| BlockTitle_MaxLengthError | Block title cannot be longer than 250 characters |
| ItemsCount | Maximum news items count |
| ItemsCount_RequiredError | News items count is required |
| ViewAllLink | "View all news" link |

The text with key "ContentBlock_LatestNews" is a convention for a human-readable name of the content block, 
where "ContentBlock_" is a required prefix and the "LatestNews" is the content block ID.

Now go to the Sana Admin and check that all texts are now more user-friendly.

### Apply Model Properties

The next step is to apply these configuration settings to the web store React component.
Since these settings are just the properties of the content block model, they can be used right away in the web store component, by accessing the provided `model` component property:

```js
const LatestNewsBlock = ({ model }) => {
  const dispatch = useDispatch();
  const { items, loadedCount } = useSelector(state => state);

  useLoadEffect(() => {
    if (loadedCount < model.itemsCount)
      dispatch(requestNews(model.itemsCount));
  }, [loadedCount, model.itemsCount]);

  return (
    <>
      {model.title && <h3>{model.title}</h3>}
      <Row as="ul" className={styles.list}>
        {items && model.itemsCount <= loadedCount && items.slice(0, model.itemsCount).map(item => (
          <Col as="li" key={item.id} md={6}>
            <Link url={item.url} to={newsItemPage(item.id)}>{item.title}</Link>
            <div className={styles.date}><DateDisplay value={item.date} /></div>
          </Col>
        ))}
      </Row>
      {model.showViewAll && <p>
        <Link to={newsPage()}>
          <SimpleText textKey="ViewAllNewsButtonText" />
        </Link>
      </p>}
    </>
  );
};
```

> [!Note]
> Notice, that all client-side model properties are in "camelCase", while on the server-side they are in "PascalCase".

## Flexible Editor in Sana Admin

Actually, the content block editor and translator in Sana Admin work pretty good and in most of the cases, it would be enough for the majority of the add-ons.

But for the sake of this tutorial, let's create a custom editor user interface just to demonstrate all possibilities provided by the Sana ADK.

Let's say, that the count of news items should not be edited as a plain integer value, but as a list of radio buttons with predefined items count values ("4", "6" or "8" items).

To accomplish the goal, the following 3 files will have to be created:
1. A content block editor React component
1. A content block translator React component
1. An `index.js` admin bundle entry point

### Content Block Editor

The general contract of a content block editor React component is that it is supplied with the following two properties:

- The `initialModel` object

    This is an unmodified content block model, as it is stored in the database, 
    or `undefined`, if it is a new content block currently being added to the page.

- The `onChange` function

    This is a callback function, which should be called, whenever and whatever happens inside the content block editor.
    
    The function accepts an object with the following properties:
    - `model` - the current (modified) content block model object
    - `valid` - a boolean value, indicating whether the current model is in the valid state or not (prevents saving the invalid model)
    - `dirty` - a boolean value, indicating whether any changes have been made, since the editor has been opened (shows the "unsaved changes" dialog when user tries to leave without saving the changes)

    The argument to an "onChange" callback does not have to always contain all these three properties — only those, which have to be reported now.

    Also keep in mind, that the "initialModel" always contains the original model state and is not updated, 
    when a modified model is passed to the "onChange" callback.
    So that, it can always be referred to, when comparing the current model with its initial values.


The admin part of Sana ADK contains a module, called `sana/forms`, which provides all required components to easily re-create the same form as the one, which is automatically generated by Sana.

Create a file `ClientApp/admin/components/LatestNewsEditor.js` with the following content:

```js
import React, { useCallback } from 'react';
import { useResourceTexts } from 'sana/texts';
import { Row, Col } from 'sana/elements';
import {
  Form, FormGroup, FieldValidationMessage,
  TextBoxField, ShowHideField, CustomField,
  RadioButtonGroup, Radio,
} from 'sana/forms';

const LatestNewsEditor = ({ initialModel, onChange }) => {
  const texts = useResourceTexts();
  const validateTitle = useCallback(value => {
    if (value && value.length > 250)
      return texts.BlockTitle_MaxLengthError;
  }, [texts]);

  return (
    <Form initialModel={initialModel} onChange={onChange}>
      <FormGroup>
        <TextBoxField name="title" label={texts.BlockTitle} maxlength={250} validate={validateTitle} />
        <FieldValidationMessage name="title" />
      </FormGroup>
      <FormGroup>
        <label>{texts.ItemsCount}</label>,
        <CustomField name="itemsCount">
          {({ name, value, onChange }) => (
            <RadioButtonGroup>
              <Radio inline name={name} value={4} onChange={onChange} checked={value === 4}>4</Radio>
              <Radio inline name={name} value={6} onChange={onChange} checked={value === 6}>6</Radio>
              <Radio inline name={name} value={8} onChange={onChange} checked={value === 8}>8</Radio>
            </RadioButtonGroup>
          )}
        </CustomField>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col md={6} lg={4}>
            <ShowHideField name="showViewAll" label={texts.ViewAllLink} />
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};
export default React.memo(LatestNewsEditor);
```

Here are the explanations of the miscellaneous things used in the above code:
- `useResourceTexts` is a React Hook, which returns an object (dictionary) of all add-on admin resource texts.
- `Form` component is a container for all inner `*Field` components, which are connected to the above form to automatically be bound to the model fields and report their valid/dirty status.
- `FormGroup` is a layout component, which groups all components related to a single field together and adds required surrounding margins.
- `TextBoxField` and `ShowHideField` components are two out of many types of field editors, provided by the Sana ADK.
- `CustomField` is a special component, which allows creating a custom field editor, but still connected to the surrounding form and bound model.
- `FieldValidationMessage` is a component, which shows or hides the field validation message. 
    The validation logic is encapsulated into the function, passed into a `validate` property of the corresponding field editor.

### Content Block Translator

The translator React component is much simpler, since the only translatable field is the content block title.

The content block translator React component is supplied with the following properties:

- `initialModel` object

    This is an unmodified content block translation, as it is stored in the database.
    It contains only properties for translated fields and not the whole content block model.

- `language` object

    The information about the target language to be translated to.

- `defaultModel` object

    A full content block model for a default language (the one edited with the previously created component).

- `defaultLanguage` object

    The information about the primary Sana Admin language to be translated from.
    By default, it's English.

- `onChange` function

    This is a callback function, exactly the same as in the content block editor contract.

Create a file `ClientApp/admin/components/LatestNewsTranslator.js` with the following content:

```js
import React from 'react';
import { Row, Col } from 'sana/elements';
import { useResourceTexts } from 'sana/texts';
import { Form, FormGroup, TextBoxField, TextBox } from 'sana/forms';

const LatestNewsTranslator = ({ initialModel, language, defaultModel, defaultLanguage, onChange }) => {
  const texts = useResourceTexts();
  return (
    <Form initialModel={initialModel} onChange={onChange}>
      <Row>
        <Col>
          <h5>{defaultLanguage.title}</h5>
        </Col>
        <Col>
          <h5>{language.title}</h5>
        </Col>
      </Row>
      <FormGroup>
        <Row>
          <Col>
            <TextBox label={texts.BlockTitle} value={defaultModel.title} readOnly />
          </Col>
          <Col>
            <TextBoxField name="title" label={texts.BlockTitle} maxlength={250} />
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};
export default React.memo(LatestNewsTranslator);
```

The translator component implementation approach is very similar to the editor approach.
The only difference is that the translator is also responsible for rendering the original (default) model values itself to help the user in the translation process.

### Admin Bundle Entry Point

The last step before testing the custom Sana Admin editor is to export the newly created components from the entry point module.

Create a file `ClientApp/admin/index.js` with the following content:

```js
import LatestNewsEditor from './components/LatestNewsEditor';
import LatestNewsTranslator from './components/LatestNewsTranslator';

export const contentBlocks = {
  'LatestNews': {
    editor: LatestNewsEditor,
    translator: LatestNewsTranslator,
  },
};
```

### Content Block Default Settings

The developer can provide predefined settings for the content element. These settings can be edited 
later by the user in 'Advanced' tab of content element settings. Just add 'defaultSettings' 
property to the corresponding content element like below:

```js
import LatestNewsEditor from './components/LatestNewsEditor';
import LatestNewsTranslator from './components/LatestNewsTranslator';

export const contentBlocks = {
  'LatestNews': {
    editor: LatestNewsEditor,
    translator: LatestNewsTranslator,
    defaultSettings: {
      minDesktopHeight: '70px',
      minTabletHeight: '70px',
      minMobileHeight: '70px',
      minDesktopWidth: '200px',
      minTabletWidth: '200px',
      minMobileWidth: '200px',
      stretchHeight: false, // true/false
      stretchWidth: false, // true/false
      margin: '1px 2px 1px 2px', // top, right, bottom, left
      padding: '1px 2px 1px 2px', // top, right, bottom, left
      horizontalAlignment: 'CENTER', // LEFT, CENTER, RIGHT, JUSTIFY
    },
  },
};
```

The list of all supported settigs is provided in this example. Note that these values are case sensitive.

### Content Block Logo

There is an ability to add content block logo which will be displayed in content element explorer on system, content, product and product list pages. 
To do this, create a logo `ClientApp/admin/latestNews.png` and add the following content to the `ClientApp/admin/index.js` file:

```js
import { default as LatestNewsLogo } from './latestNews.png';

export const contentBlocks = {
  'LatestNews': {
    // ...
    logoUrl: LatestNewsLogo,
  },
};
```

Recommended minimum logo dimensions: width - 278px, height - 142px. The bigger logo with saving appropriate aspect ratio can be added.

### Content Block Description

The developer can add content block description which will be displayed in content element explorer on system, content, product and product list pages.
To do this, extend `Admin.resx` file in 'AdminResources' folder by text using `ContentBlock_LatestNews_Description` key, where `LatestNews` is the name of the content block.

Now open Sana Admin and check the new and improved content block editor.

### Content Block Tags

There is an ability to add content block tags which will be used for filtering in content element explorer. To assign tags open `sanamanifest.xml` file and add `tags` node with needed tags from list below.
Note that the values are case sensitive and multiple tags can be assigned using `,` separator.
- `contentElement`
- `navigation`
- `headerFeatures`
- `footerFeatures`
- `animationsAndEffects`
- `forms`
- `imagesAndAudioAndVideo`
- `marketingAndPersonalization`
- `feeds`
- `navigationAndSearch`
- `newsAndBlog`
- `portfolio`
- `productsAndPromotions`
- `reportingAndAnalytics`
- `shippingAndFulfillment`
- `sliders`
- `tabsAndHarmonicas`
- `textElements`

> [!Note]
> This tags are valid only for `Content elements` category. 
> Content block `minSanaVersion` should be `1.0.18` and higher, otherwise the content block cannot be installed to SCC.

### Content Block Usage Restrictions

There is an ability to add content block usage restrictions. The value can limit content block usage by specific location (header, footer) or device (desktop, mobile). 
The value will be used to automatically hide content blocks in content element explorer if it is not apropriate for current editor.
 - `Location` content block usage restrictions can contain multiple items and defines all possible locations. To assign `location` restrictions open `sanamanifest.xml` file 
    and add `location` inside `contentBlockUsageRestrictions` node with values from list below. If there is no value (empty list) content block will be shown for all locations.
      - `header`
      - `footer` 
      
 - `Device` content block usage restrictions can also contain multiple items and defines all possible devices. To assign `device` restrictions open `sanamanifest.xml` file 
    and add `device` inside `contentBlockUsageRestrictions` node with values from list below. If there is no value (empty list) content block will be shown for all devices.
      - `desktop`
      - `mobile`

See the example below:
```js
<SanaPackageInfo>
    <metadata>
        //...
        <contentBlockUsageRestrictions>
            <location>header,footer</location>
            <device>desktop,mobile</device>
        </contentBlockUsageRestrictions>
    </metadata>
</SanaPackageInfo>
```

Note that the values are case sensitive and multiple restrictions can be assigned using `,` separator. 

> [!Note]
> This usage restrictions are valid only for `Content elements` category. 
> Content block `minSanaVersion` should be `1.0.23` and higher, otherwise the content block cannot be installed to SCC.