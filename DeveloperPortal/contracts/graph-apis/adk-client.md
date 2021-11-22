# Using the Graph client API from the ADK

Add-ons can dispatch GraphQL queries and mutations through the use of epics. It is recommended to create a folder named "behavior" in which the query and epic are saved.

## Exporting the query

If we were to create an Add-on that displays news items, we would **export** the `NewsItemsQuery`, in a file named `queries.js`.

```js
export const newsItemsQuery = `
query NewsItemsQuery($page: PagingInput){
    # Use GraphQL Query Variables to inject PagingInput
    news{
        list(page: $page){
         items{
            title
            shortDescription
          }
      }
    }
}
`
```

> [!NOTE]
> Notice the use of template literals (``) in order to preserve the new lines within the query.

## Using the query in the epic

The `newsItemsQuery` can now be imported in a file named `epic.js`. Epics get passed an api parameter which holds the `graphApi` method that can create an observable that sends a query to GraphQL and fills in its variables.

```js
// ...
const epic = (action$, _state$, { api }) => action$.pipe(
  // ...
  mergeMap(action => api.graphApi(newsItemsQuery, { page: {index: 0, size: 0} }).pipe(
    // Do something with result. Dispatch action so that reducer can save the news items in redux state
  )),
);
```
