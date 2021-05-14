# Product Wizard Add-On Tutorial

> [!NOTE]
> This tutorial requires the basic add-on development experience, covered in the base add-on development tutorial. Make sure to read it first, so that you are setup for this tutorial.

In this tutorial we will develop a custom content block in which we will render an external webpage through an IFrame. The external page will have a form where the customer can state their preferences on a number of things. With these preferences some algorithm can be implemented that will recommend a product from the webstore to the customer. If the customer were to like the recommendation and clicked a button to add it to their basket we will make the webpage rendered in the IFrame send a message to the webstore. The content block can then request through the graphapi to add the product referenced in the message to the customers basket.

## Creating the Product Wizard
We want to have a website that can be rendered through our add-on. We will make use of create-react-app, to make a website with a form. The website can send messages to the parent window which is the sana webstore. 


## Creating the Content Block Component


## Sending and Receiving Messages