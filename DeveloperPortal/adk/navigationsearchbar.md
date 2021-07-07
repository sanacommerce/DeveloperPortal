# Navigation Search Bar

Since the release of SCC 1.0.14 it is now possible to make adjustments to the webstore page header using the Visual Designer, as demonstrated in this [article](https://support.sana-commerce.com/Content/Sana-User-Guide/Design-and-Layout/Web-Store-Header.htm). This means content elements can now be added to the header. In this tutorial we will develop an add on which enables a user to search through the navigation items, similarly to how products can be searched through in the header. **Two external libraries** namely [fuse.js](https://fusejs.io/) and [autosuggest-react](https://react-autosuggest.js.org/) are utilized to implement the searching algorithm and search bar respectively. The add-on will contain specifiable options for in the admin panel, based on these options the navigation items query will be dynamically generated.

## Developing the add on project

Assuming you have set up the rudiments of an [add on project](). `package.json` can be added to the add on root to tell **npm** which external libraries we will be using.

```json
{
  "private": true,
  "dependencies": {
    "fuse.js": "^6.4.6",
    "react-autosuggest": "^10.1.0" 
  }
}
```

Now the add on project file can be updated so that npm will install the packages.

```js
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>
  <Import Project="$(MSBuildProjectDirectory)/../../Scripts/Addons/msbuild.targets" />
  <ItemGroup>
    <Compile Remove="node_modules/**" />
    <EmbeddedResource Remove="node_modules/**" />
    <None Remove="node_modules/**" />
  </ItemGroup>
  <Target Name="PreBuild" BeforeTargets="PreBuildEvent">
    <Exec Command="npm install" />
  </Target>
</Project>
```

Now we can create the class implementing the `ContentBlockModel` with the properties we want the admin user to be able to select. Along with the `ContentBlockExtension` which operates on the previously created class.

```cs
using System;
using Sana.Extensions.ContentBlocks;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace NavigationSearchBar
{
    public class NavigationContentBlock : ContentBlockModel
    {
        [Localizable(false)]
        [Display(Name = "Navigation Search Depth")]
        public int SearchDepth { get; set; }

        public string GroupCode {get; set; }
    }

    [ContentBlockId("NavigationSearchBar")]
    public class NavigationContentExtension : ContentBlockExtension<NavigationContentBlock>
    {
    }
}
```

## Add-on behavior

In order to be able to render navigation items suggestions, the navigation items must first be queried and placed in the redux state.

### Requesting Navigation Items

We will setup the requesting of navigation items.

#### Action

Once the behavior is setup it can be accessed through an action which will initiate the process. If you don't already have a `ClientApp/webstore/behavior` directory, create it and add a `actions.js` file.

```js
export const REQUEST_NAVIGATION_ITEMS = "REQUEST/NAVIGATION";

export function requestNavigation(depth=1, group="MAIN") {
  return {
    type: REQUEST_NAVIGATION_ITEMS,
    payload: {
      depth,
      group
    }
  }
};
```

Eventually, we will setup the component to be able to dispatch this action, it takes a `depth` and `group` argument whose values were specified in the admin panel.

#### Query

Typically, queries are constant string literals located. However, the navigation items query depends on the depth specified. Since there's no way to tell graphql how deep it wants to search within the tree, we need a way of dynamically creating a query. For example if the depth specified was 1, the query should look like this.

```graphql
fragment navItem on NavigationItem {
  id
  title
  link {
    target
    to {
      routeName
    }
    url
  }
  visible
}

query GetFullNavigation($group: NavigationGroupCode!) {
    navigation {
      items (groupCode: $group) {
        ...navItem
      }
   }
}
```

If the depth specified was 2 the query should look like this.

```graphql
# Insert Nav Item Fragment

query GetFullNavigation($group: NavigationGroupCode!) {
    navigation {
      items (groupCode: $group) {
        ...navItem
        children{
          ...navItem
        }
      }
    }
  }
```

Therefore, we will create a helper function which will recursively generate the amount of nav item children we need. In the `/behavior` directory, create a `helpers.js` where all the helper functions will be located.

```js
export const childrenGenerator = (size) => {
  if (size === 1) {
    return ''
  };
  return `children {
            ...navItem
            ${childrenGenerator(size-1)}
          }
        `
};
```

With this helper function the `getFullNavigationQuery` function can be created. In the `/behavior` directory, create `queries.js`.

```js
import { childrenGenerator } from './helpers';

const navItemFragment = `fragment navItem on NavigationItem {
  id
  title
  link {
    target
    to {
      routeName
    }
    url
  }
  visible
}`;

export const getFullNavigationQuery = (depth) => {
  return `query GetFullNavigation($group: NavigationGroupCode!) {
    navigation {
      items (groupCode: $group) {
        ...navItem
        ${childrenGenerator(depth)}
      }
    }
  }` + navItemFragment
};
```

#### Epic

With a function that dynamically creates a query, we can now make use of an epic to send it to GraphQL. Once the items are received the epic will dispatch an action, which we will create in a subsequent step, to notify redux that the items have been received. The epic will be placed in a newly created file `epic.js` in the `/behavior` subdirectory.

```js
import { ofType } from 'redux-observable';
import { REQUEST_NAVIGATION_ITEMS, navigationItemsReceived } from './actions';
import { switchMap, map, tap } from 'rxjs/operators';
import { getFullNavigationQuery } from './queries';


export const navigationItemsEpic = (action$, _, { api }) => action$.pipe(
  ofType(REQUEST_NAVIGATION_ITEMS),
  switchMap(action => api.graphApi(getFullNavigationQuery(action.payload.depth), {group : action.payload.group}).pipe(
    map(val=>navigationItemsReceived(val.navigation.items)),
  )),
);
```

Notice, the epic makes use of the admin specified arguments attached to the action payload making this a versatile content element.

### Navigation Items Received

The objective now is to tell redux the navigation items were received, and update state with a fuse of the navigation items, so that navigation items can easily be searched.

#### Receiving Action

If the GraphQL request was succesful, the epic will dispatch an action that will be created now. Add to the exisisting `actions.js` file in `/behavior`.

```js
// ...

export const NAVIGATION_ITEMS_RECEIVED = "NAVIGATION/ITEMS/RECEIVED";

export function navigationItemsReceived(items){
  return {
    type: NAVIGATION_ITEMS_RECEIVED,
    payload: {
      items
    }
  }
};
```

#### Flattening the received items

The shape of the items returned by GraphQL with depth, contains children nested within each navigation item. We want to extract these children so that we have a list of all the navigation items, which will allow us to create a fuse. This is done with another recursive function which we will place in `helpers.j` at `/behavior`.

```js
export const extractChildren = (items, flattenedList=[]) => {
  items.forEach((item) => flattenedList.push(item) && item.children && extractChildren(item.children, flattenedList))
  return flattenedList
}
```

#### Reducer and state

The `navigationItemsReceived` action will be received by the reducer, it will take the received items flatten them and update the state with a fuse of the flattened items. The component can then make use of the fuse to search for navigation items, based on title and url.

```js
import { NAVIGATION_ITEMS_RECEIVED } from './actions';
import Fuse from 'fuse.js';
import { extractChildren } from './helpers';

const initialState = {
  searchItems: null
}


export function reducer(state=initialState, action) {
  switch(action.type) {
    case NAVIGATION_ITEMS_RECEIVED:
      return { searchItems: new Fuse(extractChildren(action.payload.items), {keys: ['title', 'link.url'], threshold: .2 })}

    default:
      return state
  }
}
```

## Add-on Component

With the behavior created, we can now develop the component. The `NavigationBlock` component will be developed in a new file `ClientApp/webstore/components/NavigationBlock.js`.

### Connecting to redux

We mapped the searchItems state to one of the props, it will default as `null`. We additionally mapped two actions to props which serve as the dispatchers for the corresponding actions.

```js
import React from 'react'
import { requestNavigation } from 'behavior/actions'
import { navigateTo } from 'sana/events'

const NavigationBlock = ({items, requestNavigation, navigateTo}) => {
// ...
}

export default connect((state) => {return { items: state.searchItems }}, {requestNavigation, navigateTo})(NavigationBlock)
```

### Request Navigation Items

Add the `model` prop, which is an object containing the admin selected values. We will dispatch the `requestNavigation` action in a side effect.

```js
// ...
import React, { useEffect } from 'react'

const NavigationBlock = ({items, requestNavigation, navigateTo, model}) => {
    // ...
    useEffect(() => {
      requestNavigation(model.searchDepth, model.groupCode)
  }, [])
    // ...
}
// ...
```

### Suggestion Box

Now it is time to use the [autosuggest-react](https://react-autosuggest.js.org/) library to create the suggestion box, and provide it the props it needs to succesfully render suggestions. The suggestions we want the suggestion box to render will be kept in react state. The autosuggest box takes an optional theme prop, this theme can be imported from a style sheet. We will change the sana theme that is used for other search boxes, located at `SDK/Sana.Commerce.WebApp/ClientApp/src/webstore/components/objects/search/Search.module.scss`, by changing the way the `_mixins.scss` is imported. However, this is out of scope for the tutorial.

```js
import React, { useEffect, useState, useCallback } from 'react'
// Modified sana theme for autosuggest searchboxes, by changing import of mixins style sheet to relative import.
import styles from './NavigationSearchBar.module.scss';
import Autosuggest from 'react-autosuggest';
import { requestNavigation } from 'behavior/actions'
import { connect } from 'react-redux';
import Fuse from 'fuse.js'
import { navigateTo } from 'sana/events'

const renderSuggestion = suggestion => (
  <div>
    {suggestion.item.title}
  </div>
)

const NavigationBlock = ({items, requestNavigation, navigateTo, model}) => {
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const onChange = (event, {newValue, method}) => {
    setValue(newValue)
  }

  const fetchSuggestions = useCallback(({value, reason}) => {
    // Use the items returned by searching in the fuse as the suggestions state
    setSuggestions([...items.search(value)])
  }, [items])

  const getSuggestionValue = (suggestion) => {
    return suggestion.item.title
  }

  const onSelect = (event, { suggestion }) => {
    console.log(suggestion)
    navigateTo(null, suggestion.item.link.url)
  }

  useEffect(() => {
    requestNavigation(model.searchDepth, model.groupCode)
  }, [])
  return (
    // Wait for the fuse to load, only then will the suggestion box be rendered
    items && (
      <Autosuggest
        onSuggestionsClearRequested={()=>{setSuggestions([])}}
        theme={styles}
        renderSuggestion={renderSuggestion}
        inputProps={{value, onChange, placeholder: "Search in navigation.."}}
        id="navigation"
        getSuggestionValue={getSuggestionValue}
        onSuggestionsFetchRequested={fetchSuggestions}
        suggestions={suggestions}
        onSuggestionSelected={onSelect}
      />
    )
  )
}
// ...
```

## Finalizing the Add On

Finally, we create `ClientApp/webstore/index.js`.

```js
import { navigationItemsEpic as epic } from 'behavior/epic'
import { reducer } from 'behavior/reducer'
import NavigationSearchBar from "./components/NavigationBlock"


export { reducer, epic };

export const contentBlocks = {
  NavigationSearchBar
}
```

## Final Remarks

In this tutorial you created an add-on which can be used for searching navigation items. Through, offering specifiable parameters, the content element became very flexible in its usage. Due to constant improvements in the sana framework, the content element could now be placed in the navigation bar, which is the preferable location for this add-on.
