# Product Wizard Add-On Tutorial

> [!NOTE]
> This tutorial requires the basic add-on development experience, covered in the base add-on development tutorial. Make sure to read it first, so that you are setup for this tutorial.

In this tutorial we will develop a custom content block in which we will render an external webpage through an iframe. The external page will have a form where the customer can state their preferences on a number of things. With these preferences some algorithm can be implemented that will recommend a product from the webstore to the customer. If the customer were to like the recommendation they can click a button to add it to their basket. We will make the webpage rendered in the iframe send a message throught the browser to the webstore. The content block can then request through the graphapi to add the product referenced in the message to the customers basket.

## Creating the Product Wizard

We want to have a website that can be rendered in our add-on. We can make use of create-react-app, to make a website with a form. The form asks the user what their interest is, in reality you might have many more questions so that you can more accurately recommend a product to a user. In reality, you might calculate the recommendation on a backend.

### Rendering the form

```js
import { useState } from 'react';
// We applied styling to center the App
import "./App.css"

function App() {
    let [result, setResult]  = useState(null)
    let [interest, setInterest] = useState("tech")
    const handleSubmit = event => {
        // sets the recommendation based on preferences, can be more extensive in reality
        if (interest === "tech") {
            setResult({name: "T-Shirt", orderInfo: { productId:"PRODUCT1", variantId: null, quantity: 1}})
        }
        if (interest === "fashion") {
            setResult({name: "Dress", orderInfo: {productId:"PRODUCT5", variantId: "VAR2", quantity: 1}})
        }
        event.preventDefault();
    }
    if (!result) {
        return (
        <div className="App">
            <div>
            <label>What are you into?</label>
            <form onSubmit={handleSubmit}>
                <select id="interest" value={interest} onChange={(e)=>setInterest(e.target.value)}>
                    <option value="tech">Technology</option>
                    <option value="fashion">Fashion</option>
                </select>
                <input id="formButton" type="submit" />
            </form>
            </div>
        </div>
        );
    } else {
    return (
      <div className="App">
        We think you will like {result.name}.
      </div>
    )
  }
}

export default App;
```

### Sending Messages

The react webpage will be rendered by the webstore window, this means we will have a reference to it through `window.parent`. We will add a function to the form component that will communicate with the parent window and send the currently recommended product to the webstore.

```js
  // ...
  const addToBasket = () => {
    let targetWindow = window.parent
    console.log("Adding to basket")
    // targetWindow will not be undefined when rendered by another window.
    targetWindow && targetWindow.postMessage(result.orderInfo, "*")
  }
  // ...
```

Add a button so that a user can trigger the `addToBasket` in the case they want to add it to their basket.

```js
    return (
      <div className="App">
        We think you will like {result.name}.
        <div>
          <button onClick={addToBasket}>
            Add this product to shopping cart
          </button> 
          <button onClick={() => setResult(null)}>
            I don't want this product.
          </button>
        </div>
      </div>
    )
```

Now you should be able to build and host the product wizard webpage somewhere, make sure everything works.

## Creating the content block

The Add-On can now be created, considering you have done the basic setup for an add-on. We begin by updating the class inheriting from `ContentBlockModel` to allow for two properties that will be passed to the component. This is done in `Addons/ProductWizard/ProductWizard.cs`.

```cs
using Sana.Extensions.ContentBlocks;

namespace ProductWizard
{
    public class ProductWizardModel : ContentBlockModel
    {
        // Location of the product wizard webpage.
        public string Source { get; set; }

        // Title of the form
        public string Title { get; set; }
    }

}
```

### Rendering the webpage

We can make a component for the content block, it takes the model as a prop, from which we can get the `source` and the `title`. In this component we will make use of an `iframe` to render the previously created product wizard page. Create a file `Addons/ProductWizard/ClientApp/webstore/components/productwizard.js` for the block component.

```js
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

const ProductWizardBlock = ({ model: { title, source } }) => {
  return (
    <div>
      <h4>
        {title}
      </h4>
      <iframe title={title} src={source} width="560" height="315" />
    </div>
  );
};

ProductWizardBlock.propTypes = {
  model: PropTypes.shape({
    title: PropTypes.string,
    source: PropTypes.string
  }),
};

export default ProductWizardBlock;
```

### Receiving messages

Once the component block has rendered we will setup the webstore window to listen to messages sent from the iframe webpage. This can be done through a side effect, we will setup an event listener for the webstore window that listens to messages for the lifetime of the `ProductWizardBlock` component.

```js
// ...
const ProductWizardBlock = ({ model: { title, source } }) => {
  const completionListener = event => {
    // Do we trust the sender of this message?
    if (event.origin === source) {
      event.data && alert(event.data)
    }
  };
  useEffect(() => {
    window.addEventListener('message', completionListener);
    return () => {
      window.removeEventListener('message', completionListener);
    };
  }, []);
  // ...
}
// ...
```

### Processing the messages - Behavior

Instead of alerting the product info to the user as is done in the `completionListener` as of now, we want to dispatch an action that will lead to this product to be added to the basket. At `Addons/ProductWizard/ClientApp/webstore/behavior` create an `actions.js` file which will hold the action we need.

```js
export const ADD_PRODUCT = 'ADD_PRODUCTS';
export const addProductToBasket = product => ({
  type: ADD_PRODUCT,
  payload: {
    lines: [product],
  },
});
```

> [!TIP]
> Browse the schema on the `/api/graph` of your sana solution or checkout the [playground](../graph-apis/playground.md), so that you learn to make your own queries.

We can now write the mutation which can be used to add the product to the basket. In the same `behavior` folder create `queries.js`. Where you will export this mutation as a string in a constant variable named `addProductMutation`, similarly to how it is done in the [GraphQL intoduction article](../graph-apis/intro.md#ExportingQueries).

```graphql
mutation AddProduct($lines:[BasketLineInput!]!) {
 basket{
    addProducts(lines:$lines){
      modifiedLines{
        totalCount
      }
    }
  }
}

```

Now we can create a simple epic that acts on this action, it will query the graph api and wait for the product to be added to the basket.

```js
import { ofType } from 'redux-observable';
import { ADD_PRODUCT } from './actions';
import { addProductMutation } from './queries';
import { switchMap, map, tap } from 'rxjs/operators';
import { basketChangeCompleted } from 'sana/events';

export const addOrderEpic = (action$, _, { api }) => action$.pipe(
  ofType(ADD_PRODUCT),
  switchMap(action => api.graphApi(addProductMutation, action.payload).pipe(
    map(val=>basketChangeCompleted(val.basket.addProducts.modifiedLines.totalCount)),
  )),
);
```

The `basketChangeCompleted` event emitted if the product was sucessfully added, it will notify the user that the basket has been updated. The `addProductToBasket` action can now be dispatched and will lead to the product to be added to the basket. In the `completionListener` at `Addons/ProductWizard/ClientApp/webstore/components/productwizard.js` we can now dispatch this action.

```js
// ...
const ProductWizardBlock = ({ model: { title, source } }) => {
// ...
  const dispatch = useDispatch();
  const completionListener = event => {
    // Do we trust the sender of this message?
    
    if (event.origin === source) {
      // Instead of alerting the product we now dispatch an action that will add it to the basket
      event.data && dispatch(quickOrderAddProducts(event.data));
    }
  };
// ...
}
// ...
```

### Finishing the webstore

Finally, we setup the epic and the `ProductWizardBlock` in the `index.js` file at `ClientApp/webstore`.

```js
import ProductWizard from 'components/productwizard';

export { addOrderEpic as epic } from 'behavior/epic';
export const contentBlocks = {
  ProductWizard,
};
```

## Final remarks

In this tutorial you created a small application using create-react-app. You learned how to communicate with the webstore through a spawned window, and you interacted with the graph to add a product to the basket. A simple tutorial which showcases the flexibility and usabilty of the ADK.
