# Orders Map Add-On Tutorial

> [!NOTE] This tutorial requires the basic add-on development experience, covered in the base add-on development tutorial. Make sure to read it first, so that you are setup for this tutorial.

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

In order for these to be installed into node_modules, we will have to add a `PreBuildEvent` to `SalesMap.csproj`, which will run `npm install`.

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Folder Include="ClientApp/" />
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

In the `SalesMap/ClientApp/webstore` directory we must create a `behavior` directory where we can create the necessary files.

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

Let us create an action that can be dispatched to redux from our component in order to initiate the process of firing our query. Additionally, we will create an action that will be dispatched when the querying has completed. Let us create a file where we will place these actions and future actions `Addons/SalesMap/ClientApp/behavior/actions.js`.

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

We want this action to be handled by an epic that only accepts type `ORDERS_INFO_REQUESTED` which will asynchronously handle the querying of orders placed. Let us now create a file for our epics which we will call `Addons/SalesMap/ClientApp/behavior/epic.js`. Try to create this epic, it should make use of the api parameter that is provided to every epic, which contains a way to query the GraphAPI in a observable.

#### Orders reducer

Once the orders are loaded in the epic, the list of orders should be mapped to the `loadOrdersInfo` action so that we can have our reducer handle it. We can now create a file `Addons/SalesMap/ClientApp/behavior/redcuer.js` which contains the reducer which will react to this action.

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

Since we want to group orders per location, we will have to map our orders through another function so that they get combined. Going back to `Addons/SalesMap/ClientApp/behavior/epic.js` we have made these improvements.

```js
// ...

import _ from "lodash";

export const ordersInfoEpic = (action$, _, { api }) =>
  action$.pipe(
    ofType(ORDERS_INFO_REQUESTED),
    switchMap((action) => api.graphApi(ordersQuery).pipe(
          pluck("documents", "orders", "list"),
          // We have added a map to this function which will combine locations and sum total sales per location. 
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

The billing adresses of the orders do not include coordinates, which are needed in order to draw a circle on a map at their corresponding locations. We will make use an external api [positionstack](http://api.positionstack.com/) to get the coordinates for each location. After the locations are set in the add-on redux state, we can asyncronously request the coordinates for each location by means of an epic. We can now create an additional epic in `Addons/SalesMap/ClientApp/behavior/epic.js`.

```js
export const coordsEpic = (action$, _, { api }) => action$.pipe(
  ofType(ORDERS_INFO_LOADED),
  pluck('payload', 'orderInfo'),
  switchMap(orders => from(orders).pipe(
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
      tap(console.log),
      map(loadCoordinatesInfo),
      retry(2),
    )),
  )),
);
```
