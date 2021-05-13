# Orders Map Add-On Tutorial

> [!NOTE]
> This tutorial requires the basic add-on development experience, covered in the base add-on development tutorial. Make sure to read it first, so that you are setup for this tutorial.

In this tutorial we will show you steps in the development of an add-on for a world map that shows all orders grouped by location on your website. The Sana GraphQL API will be invoked to retrieve these orders, and we will be using an external api to get the coordinates of these locations. We will make use of an external library called [leaflet](https://www.npmjs.com/package/leaflet) for mapping features that allow us to draw circles on a world map reflecting the order amounts per location. Additionally, we only want this map to be rendered when the user is a sales agent. So as to achieve these objectives multiple epics and a reducer will have to be used. We will also setup **npm** to install the necessary eslint and remaining dependencies for our add-on.

## Setting up the add-on for development

Considering you have setup the project and folder structure of a basic add-on. We can now add a `package.json` file at the root of our add-on project to target our dependencies.

```json
{
  "private": true,
  "dependencies": {
    "@typescript-eslint/parser": "^4.18.0",
    "classnames": "2.2.6",
    "eslint-config-defaults": "^9.0.0",
    "eslint-plugin-flowtype": "^5.4.0",
    "eslint-plugin-react": "^7.22.0",
    "leaflet": "^1.6.0",
    "lodash": "^4.17.21",
    "prop-types": "15.7.2",
    "typescript-eslint": "0.0.1-alpha.0"
  },
  "devDependencies": {
    "@babel/preset-env": "^7.12.1",
    "@loadable/babel-plugin": "5.11.0",
    "@typescript-eslint/eslint-plugin": "^4.8.2",
    "@typescript-eslint/parser": "^4.8.2",
    "babel-eslint": "9.0.0",
    "babel-jest": "25.1.0",
    "babel-loader": "8.0.6",
    "babel-plugin-module-resolver": "4.0.0",
    "babel-preset-react-app": "9.1.0",
    "eslint": "^5.6.0",
    "eslint-config-react-app": "^3.0.8",
    "eslint-plugin-import": "^2.22.1",
    "eslint-plugin-jsx-a11y": "^6.4.1",
    "identity-obj-proxy": "3.0.0",
    "jest": "25.1.0",
    "react": "16.12.0",
    "react-dom": "^16.12.0",
    "react-test-renderer": "16.12.0",
    "typescript": "^4.1.3"
  }
}
```

In order for these to be installed into node_modules, we will have to add a `PreBuildEvent` to `OrdersMap.csproj`, which will run `npm install`.

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Folder Include="OrdersMap/" />
  </ItemGroup>
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

## Add-on behavior

In the `OrdersMap/ClientApp/webstore` directory we must create a `behavior` directory where we can create the necessary files.

### Orders behavior

Before we start working on our component, we need a way of invoking the GraphQL Api to get a list of the orders placed.

#### Orders query

In the `behavior` subdirectory create a new file called `queries.js`.
Where we will create the query we need for getting a list of placed orders.

```js
export const ordersQuery = `
query LatestOrders(){
  documents{
    orders{
      list(options: { page: { index:0,size:0 } }){
        totalCount
        items{
          totals{
            totalPrice
          }
          billingAddress{
            city
            countryId
          }
        }
      }
    }
  }
}
`;
```

#### Orders actions

Let us create an action that can be dispatched to redux from our component in order to initiate the process of firing our query. Additionally, we will create an action that will be dispatched when the querying has completed. Let us create a file where we will place these actions and future actions `Addons/OrdersMap/ClientApp/behavior/actions.js`.

```js
export const ORDERS_INFO_REQUESTED = "ORDERS_INFO/REQUESTED";
export function requestOrdersInfo() {
  return {
    type: ORDERS_INFO_REQUESTED,
  };
}
export const ORDERS_INFO_LOADED = "ORDER_INFO/LOADED";
export function loadOrdersInfo(list) {
  return {
    type: ORDERS_INFO_LOADED,
    payload: {
      orderInfo: list.items,
      totalCount: list.totalCount,
    },
  };
}
```

#### Orders epic

We want this action to be handled by an epic that only accepts type `ORDERS_INFO_REQUESTED` which will asynchronously handle the querying of orders placed. Let us now create a file for our epics which we will call `Addons/OrdersMap/ClientApp/behavior/epic.js`. The epic makes use of the api parameter that is provided to every epic, which contains a way to query the GraphAPI in an observable.

```js
// ...
export const ordersInfoEpic = (action$, _, { api }) =>
  action$.pipe(
    ofType(ORDERS_INFO_REQUESTED),
    switchMap((action) => api.graphApi(ordersQuery).pipe(
          pluck("documents", "orders", "list"),
          // An object of list items and the total count of items gets mapped to the loadOrdersInfo action
          map(loadOrdersInfo)
        )
    )
  );

```

#### Orders reducer

Once the orders are loaded in the epic, the list of orders are mapped to the `loadOrdersInfo` action so that we can have our reducer handle it. We can now create a file `Addons/OrdersMap/ClientApp/behavior/reducer.js` which contains the reducer which will react to this action.

```js
// ...
const initialState = {
  accountType: null,
  orderInfo: [],
  totalCount: 0,
};

export default function orderInfoReducer(state = initialState, action) {
  switch (action.type) {
    case ORDERS_INFO_LOADED:
      const returnData = { ...state, ...action.payload };
      return returnData;

    default:
      return state;
  }
}
```

#### Improving the orders epic

Since we want to group orders per location, we will have to map our orders through another function so that they get combined. Going back to `Addons/OrdersMap/ClientApp/behavior/epic.js` we have made these improvements.

```js
// ...

import _ from "lodash";

export const ordersInfoEpic = (action$, _, { api }) =>
  action$.pipe(
    ofType(ORDERS_INFO_REQUESTED),
    switchMap((action) => api.graphApi(ordersQuery).pipe(
          pluck("documents", "orders", "list"),
          // We have added a map to a function which will combine locations and sum total sales per location. 
          map(extractOrderInfo),
          map(loadOrdersInfo)
        )
    )
  );

const extractOrderInfo = (data) => {
  const items = [];
  let totalCount = data.totalCount;
  data.items.forEach((item) => {
    const addressInList = items.filter((extractedItem) =>
      // We are using lodash to test whether two order locations have the same key value pairs
      _.isEqual(item.billingAddress, extractedItem.billingAddress)
    );
    if (addressInList.length === 1) {
      // If they are equal we will add the total sales to the first order with the same location, and reduce the total count to reflect that we are shortening our list of orders.
      const sameBillingItem = addressInList[0];
      sameBillingItem.totals.totalPrice += item.totals.totalPrice;
      totalCount--;
    } else {
      // If the location has not been found in the already found locations we will add it to the found locations.
      items.push(item);
    }
  });
  return { totalCount, items };
};
```

### Location coordinates

The billing adresses of the orders do not include coordinates, which are needed in order to draw a circle on a map at their corresponding locations. We will make use an external api [positionstack](http://api.positionstack.com/) to get the coordinates for each location. After the locations are set in the add-on redux state, we can asyncronously request the coordinates for each location by means of an epic. We can now create an additional epic in `Addons/OrdersMap/ClientApp/behavior/epic.js`. The api parameter also contains an observable form of fetch, which we will use for fetching data from an external api.

```js
// ...

export const coordsEpic = (action$, _, { api }) => action$.pipe(
  ofType(ORDERS_INFO_LOADED),
  pluck('payload', 'orderInfo'),
  // We now have plucked a list of orders from the action. With the rxjs from observable we can stream each order into concatMap which will fetch the coordinates. 
  switchMap(orders => from(orders).pipe(
    // Using concatMap assures us that the inner observable, api.fetch, has to have emitted a value before it can be used again. We do this in order to prevent all order coordinates from being fetched simultaneously, because of the api rate limiting. 
    concatMap(order => api.fetch(`${GeoAPI}&query=${order.billingAddress.city} ${order.billingAddress.countryId}`).pipe(
      pluck('data'),
      map(locationInfo => {
        if (locationInfo[0].latitude === undefined && locationInfo[0].longitude === undefined) {
          console.log('Threw error');
          throw Error();
        }
        const coords = [locationInfo[0].latitude, locationInfo[0].longitude];
        return { order, coords };
      }),

      // We will create this action in the next step
      map(loadCoordinatesInfo),
      // If the error was thrown due to latitude and longitiute being undefined, it will retry fetching the api up to 2 times.
      retry(2),
    )),
  )),
);

// ...
```

If the api sucessfully responds, the epic will have to emit an action with the coordinates and its corresponding order. We can now add an action to `Addons/OrdersMap/ClientApp/behavior/actions.js`.

```js
export const COORDS_LOADED = 'COORDS/LOADED';
export function loadCoordinatesInfo(data) {
  return{
    type: COORDS_LOADED,
    payload: {
      // Data contains the order for which the coordinates were loaded and the coordinates
      ...data,
    },
  };
}
```

Now that the epic can successfully map to an action, it will be dispatched to redux. We must create a way for this action to update the order in the redux state. We should update the reducer at `Addons/OrdersMap/ClientApp/behavior/reducer.js`.

```js
import _ from 'lodash';
// ...

export default function orderInfoReducer(state=initialState, action) {
  switch (action.type){
    // ...
    case COORDS_LOADED:
      const _newState = { ...state };
      // A list of the orders with one of them changed to contain the loaded coordinates
      const newOrders = _newState.orderInfo.map(order=> {
      // With lodash we will find which order is equal to the order for which we found the coordinates
        if(_.isEqual(order, action.payload.order)) {
          // For the order that is equal to the order for which we found the coordinates, it will add the coordinates to it
          order.coords = action.payload.coords;
          order.coordsLoaded = true;
          // Return a copy of the order so that redux knows the state has changed
          return { ...order };
        }
        return order
      });
      return { ..._newState, orderInfo: newOrders };

    default:
      return state;
  }
}
```

### Account type

The addon we are creating can be added to any page on the client application. However, we want the addon functionality to be limited to sales agents exclusively. We must create additional behavior in order to request the account type of the currently connected user. With that information we can decide on whether to render the addon. Let's begin by creating an action for requesting account type and one for when it has been loaded in. Add these actions to `Addons/OrdersMap/ClientApp/behavior/actions.js`.

```js
// ...
export const ACCOUNT_TYPE_REQUESTED = 'ACCOUNT_TYPE/REQUESTED';
export function requestAccountType() {
  return {
    type: ACCOUNT_TYPE_REQUESTED,
  };
}

export const ACCOUNT_TYPE_LOADED = 'ACCOUNT_TYPE/LOADED';
export function loadedAccountType(accountType) {
  return {
    type: ACCOUNT_TYPE_LOADED,
    payload: {
      accountType,
    },
  };
}
```

To get the account type we have to query GraphQL. We will write the query that we want to use in `Addons/OrdersMap/ClientApp/behavior/queries.js`.

```js
export const getShopAccountType = `
query ShopAccount{
  viewer{
    shopAccountType
  }
}`;
```

Now we can create an additional epic that will react to the `requestAccountType` action. We can add this epic to `Addons/OrdersMap/ClientApp/behavior/epic.js`.

```js
export const accountTypeEpic = (action$, _, { api }) => action$.pipe(
  ofType(ACCOUNT_TYPE_REQUESTED),
  // Uses our previously created query
  switchMap(action => api.graphApi(getShopAccountType).pipe(
    pluck('viewer', 'shopAccountType'),
    map(loadedAccountType),
  )),
);
```

Finally, we must update the state to reflect the change in account type.

```js
import { ACCOUNT_TYPE_LOADED, COORDS_LOADED, ORDERS_INFO_LOADED } from './actions';
import _ from 'lodash';

const initialState = {
  accountType: null,
  orderInfo: [
  ],
  totalCount: 0,
};

export default function orderInfoReducer(state=initialState, action) {
  switch (action.type){
    case ACCOUNT_TYPE_LOADED:
      return { ...state, accountType: action.payload.accountType };

    default:
      return state;
  }
}
```

## Orders map component

Now that our behavior is finalized, we can start creating the component. Create a components directory for the development of our component, `Addons/OrdersMap/ClientApp/webstore/components`. Within this directory we can make the file for the component, `OrderMapBlock.js`.

### Importing the external library

Our component will make use of an external library called leaflet. However, we do not want leaflet to be imported during server side rendering because it leads to errors. We will thus create a seperate file in which we conditionally import and export leaflet if we are not server side rendering. We did this in `Addons/OrdersMap/ClientApp/webstore/components/_leaflet.js`.

```js
// The window object won't be defined during server side rendering
if (typeof window !== 'undefined') {
  module.exports = require('leaflet');
} else {
  module.exports = null;
}
```

Within `Addons/OrdersMap/ClientApp/webstore/components/OrderMapBlock.js` we can now import leaflet using es6 importing syntax as such, as well as the leaflet stylesheet.

```js
import Leaflet from './_leaflet';
import 'leaflet/dist/leaflet.css';

```

### Creating the component

Let us first make sure our component will only return a title and a map when the user is logged in as a sales agent. All our development from now on will be in `Addons/OrdersMap/ClientApp/webstore/components/OrderMapBlock.js`.

```js
import React, { useEffect, useRef, useState } from 'react';
import { requestAccountType, requestOrdersInfo } from '../behavior/actions';
import { useSelector, useDispatch } from 'react-redux';
// ...

function OrdersMap() {
  const { locationInfo, orderInfo, accountType } = useSelector(state => state);
  const mapRef = useRef();

  return (
      <>
        {
          accountType === 'SALES_AGENT' && (
          <>
            <h4>World Orders Map</h4>
            {/* We use mapRef as a reference to this div, so that we can insert the leaflet map here during a side effect */}
            <div style={{ height:'400px' }} ref={mapRef} />
          </>
          )
        }
      </>
  );
}

export default React.memo(OrdersMap);
```

We will use the `useEffect` hook to perform a side effect in which we load a map when it is not already laoded. This effect will be run after the first render and after the render the user account type has changed.

```js
function OrdersMap() {
  const dispatch = useDispatch();
  // We will save a reference to the leaflet map in react state
  const [map, setMap] = useState(undefined);
  // ...
  useEffect(() => {
    if (accountType) {
      if (accountType === 'SALES_AGENT') {
        // Creates the leaflet map 
        const myMap = Leaflet.map(mapRef.current).setView([51.94, -4.3], 4);
        // Configures the api
        Leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGlvbnl6b3oiLCJhIjoiY2ttMGd3YWE4M21maTJ2bndoeGxpNnppYyJ9.XK2Ei2B49D3L0jzjaTTKNw', {
          attribution: 'Order Information &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/light-v9',
          accessToken: 'pk.eyJ1IjoiZGlvbnl6b3oiLCJhIjoiY2ttMGd3YWE4M21maTJ2bndoeGxpNnppYyJ9.XK2Ei2B49D3L0jzjaTTKNw',
        }).addTo(myMap);
        // Saves the leaflet map in react state
        setMap(myMap);
        if (!orderInfo.length) {
          dispatch(requestOrdersInfo());
        }
      }
    } else {
      dispatch(requestAccountType());
    }
  }, [accountType]);
  // ...
```

Any time the map or the orders change we want a side effect to check whether it can draw all the orders as circles on the map.

```js
// ...
function random() {
  return  Math.floor(Math.random() * 255);
}

function OrdersMap() {
    // ...
    useEffect(() => {
      // If the map has been made
    if (map) {
      const readyOrders = orderInfo.filter(order => order.coordsLoaded);
      // Make sure all orders have their coordinates loaded
      if (readyOrders.length === totalCount) {
        // Proceed to draw every order location on the map
        for (const location of readyOrders) {
          try {
            console.log(location);
            const circle = Leaflet.circle(location.coords, { radius:location.totals.totalPrice * 50, color: `rgb(${random()},${random()},${random()})` }).addTo(map);
            circle.bindPopup(`Total sales in ${location.billingAddress.city}: ${location.totals.totalPrice}`);
          } catch {
            console.log('Failed to add location: ' + location.billingAddress.city + 'to the map');
          }
        }
      }
    }
  }, [map, orderInfo]);
  // ...
}
// ...
```

## Finalizing the add on

We have created the behavior and the component that will make use of it. We can finish off the addon by providing the content block component and the epic and reducer in the ClientApp index. Do this in `Addons/OrdersMap/ClientApp/webstore/index.js`.

```js
import OrderMapBlock from './components/OrderMapBlock';
import reducer from './behavior/reducer';
import { ordersInfoEpic, coordsEpic, accountTypeEpic } from 'behavior/epic';
import { combineEpics } from 'redux-observable';

const epic = combineEpics(ordersInfoEpic, coordsEpic, accountTypeEpic);
export { reducer, epic };

export const contentBlocks = {
  'OrdersMap': OrderMapBlock,
};
```

The addon can now be added to any page and will only be displayed to sales agents. Today you have learned to develop an extensive addon. You have learned how to use an external library in an addon. You have learned how to use multiple reducers to asynchronously fetch data, you have learned how we may work with this data to get new data, and how we can represent this data on the front end.
