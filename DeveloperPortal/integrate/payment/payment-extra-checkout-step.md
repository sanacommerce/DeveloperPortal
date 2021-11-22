# Extra checkout step for payment method

Payment provider may require additional information. This information can be gathered in extra step during checkout.

From this article you will learn how to add extra checkout step in payment extension.

## How to add extra step to payment extension

Let's assume that you already have implemented payment extension class.
You can find more information in this [article](create-payment-extension.md).

**Step 1**: Create a class and inherit it from `ExtraCheckoutStepPageModel`. 
Implement all abstract methods, let's leave it without implementation for now.

```cs
public class ExtraStepModel : ExtraCheckoutStepPageModel
{
    public override void Initialize()
    {
    }

    public override void SaveData(ExtraStepSaveDataRequestContext context)
    {
    }

    public override bool IsDataValid()
    {
        return true;
    }
}
```

**Step 2**: Implement `CreateExtraCheckoutStepModel` method in the payment extension.

```cs
public override ExtraCheckoutStepPageModel CreateExtraCheckoutStepModel(ExtraCheckoutStepModelContext context)
{
    return new ExtraStepModel();
}
```

**Step 3**: Override `CreateClientModel` method and return there a model which is required to manage data in the checkout step.

```cs
public class ExtraStepModel : ExtraCheckoutStepPageModel
{
    public override object CreateClientModel()
    {
        return new
        {
            cardNumber = api.SecureInMemoryStorage.Retrieve("CardNumber")
        };
    }

    ...
}
```

**Step 4**: Add React component editor for the extra checkout step.
Create a component under `/ClientApp/webstore/components`.
Then export it in `/ClientApp/webstore/index.js` as `ExtraCustomStep` field of the payment module.

```js

import ExtraCheckoutStep from './components/ExtraCheckoutStep';

export const paymentModules = {
  PaymentModuleID: { ExtraCustomStep: ExtraCheckoutStep },
};

```

There `PaymentModuleID` should be replaced with ID of payment module.

Please check component example below.

```js
import React from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  FormError,
  FieldError,
  FieldLabel,
  FormGroup,
  TextBoxField,
  HiddenSubmitButton,
} from 'sana/forms';
import { UseSanaTexts } from 'sana/texts';

const ExtraCheckoutStep = ({ model, dataForm }) => (
  <UseSanaTexts textKeys={[ 'CardNumber' ]}>
    {([ cardNumberFieldTitle ]) => (
      <Form
        name="paymentCardForm"
        formRef={dataForm.ref}
        onSubmit={dataForm.onSubmit}
        onBlur={dataForm.onBlur}
        initialValues={model}
      >
        <FormError />
        <FormGroup
          label={<FieldLabel fieldName="cardNumber">{cardNumberFieldTitle}</FieldLabel>}
          field={(
            <TextBoxField
              fieldName="cardNumber"
              validation={{ maxLength: { max: 100 }, required }}
              fieldTitle={cardNumberFieldTitle}
            />
          )}
        />
        <HiddenSubmitButton />
      </Form>
    )}
  </UseSanaTexts>
);

ExtraCheckoutStep.propTypes = {
  model: PropTypes.shape({
    cardNumber: PropTypes.string,
  }).isRequired,
  dataForm: PropTypes.shape({
    ref: PropTypes.shape({
      current: PropTypes.any,
    }).isRequired,
    onBlur: PropTypes.func,
    onSubmit: PropTypes.func,
  }).isRequired,
};

export default ExtraCheckoutStep;
```

> [!Note]
> We provide text key `CardNumber` in `UseSanaTexts`. The text itself should be added to a resource file by the specified key.
> Keep in mind that the text will be used on Sana webstore, modify corresponding resource file for that.
> You can read more information about resource files in extension packages in [package structure article](../package-structure_scc.md).

**Step 5**: Define step title. You need to add step title webstore text to resource file in the package.
`ExtraStepModel` class should return key of the text in overridden `TitleKey` property. Let's say you added extra step title 
text with a key `ExtraStepTitle`. Add property to `ExtraStepModel` class:

```cs
public class ExtraStepModel : ExtraCheckoutStepPageModel
{
    ...

    public override string TitleKey => "ExtraStepTitle";
    
    ...
}
```

**Step 6**: Add logic to `SaveData` method. In typical scenario you need to save data from extra step and use it 
in `StartPayment` method of your payment extension. Let's use secure storage to store card number.
To store data you need to access `SanaApi`. Create constructor in `ExtraStepModel` class which gets instance of `Extension.Api` and assign it to a private field.

```cs
public class ExtraStepModel : ExtraCheckoutStepPageModel
{
    SanaApi api;

    public ExtraStepModel(SanaApi api)
    {
        this.api = api;
    }

    ...
}
```

Change `CreateExtraCheckoutStepModel` method in the payment extension class and provide instance of `Extension.Api` to the constructor.

```cs
public override ExtraCheckoutStepPageModel CreateExtraCheckoutStepModel(ExtraCheckoutStepModelContext context)
{
    return new ExtraStepModel(Api);
}
```

Now you can use `Extension.Api` to save the data.

```cs
public class ExtraStepModel : ExtraCheckoutStepPageModel
{
    ...

    public override void SaveData(ExtraStepSaveDataRequestContext context)
    {
        if (context.Values == null)
        {
            context.Errors[""] = "Some general error."; // you can use your Sana text here
            return;
        }

        var cardNumber = (string)context.Values["cardNumber"];
        if (string.IsNullOrEmpty(cardNumber))
            context.Errors.Add("cardNumber", "Card number is missed."); // you can use your Sana text here
        else
            this.api.SecureInMemoryStorage.Remember("CardNumber", cardNumber);
    }

    ...
}
```

> [!Note]
> You can also use `SanaApi.Data` to store data of the extra checkout step. More information you can find [here](../reference/extension-api-data.md).

**Step 7**: Add validation logic to extra step data if needed. Override method `IsDataValid` and add validation logic there.
Let's assume that you have added `ValidateCardNumber` method with logic of credit card validation. 
You need to add following code:

```cs
public class ExtraStepModel : ExtraCheckoutStepPageModel
{
    ...

    public override bool IsDataValid()
    {
        var cardNumber = this.api.SecureInMemoryStorage.Retrieve("CardNumber");
        return ValidateCardNumber(cardNumber);
    }

    ...
}
```

Sana will determine step as a completed only when step's data is valid.

> [!Note]
> In case if data validation is not needed just return true in this method.

**Step 8**: Provide checkout step summary information which will be displayed in checkout summary section.
Override method `GetCheckoutSummaryLine` and return summary information. For current example we will skip this step.

> [!Note]
> If `GetCheckoutSummaryLine` method returns null in summary section you will see only title of the step without additional information.

**Result**: as a result you should see extra checkout step on which user enters card information.

## How to use collected data in payment extension

All data saved by checkout step is available in `StartPayment` method.

```cs
public override NextAction StartPayment(PaymentStartContext context)
{
    var cardNumber = this.api.SecureInMemoryStorage.Retrieve("CardNumber");
    ...
}
```

## Communication from client to server in extra step

Sometimes it is needed to make calls from client side to server side in extra checkout step.
Let's imagine that card validation logic is complicated and cannot be implemented on client side as in our example.
But we want to improve usability and perform the validation immediately after customer entered it. So we need a possibility to make calls from client side to server side.
`executeCommand` from editor component props should be used for commands executing on server side.

Here is an example of `executeCommand` usage in editor component.

```js
const Commands = Object.freeze({
  VALIDATE_CARD_NUMBER: 'validateCardNumber',
});

const ExtraCheckoutStep = ({ model, dataForm, executeCommand, lockCheckout }) => {
  
  const validateCardNumber = async () => {
    const unlock = lockCheckout(); // lockCheckout should be used to lock checkout until command is executing
    const cardNumber = dataForm.ref.current.values.cardNumber; // retrieve card number from form values

    const validationResult = await executeCommand({ command: Commands.VALIDATE_CARD_NUMBER, cardNumber })
        .finally(unlock);

    return validationResult.error;
  };

  ...

  <FormGroup
    label={<FieldLabel fieldName="cardNumber">{cardNumberFieldTitle}</FieldLabel>}
    field={(
    <TextBoxField
        fieldName="cardNumber"
        validation={{ maxLength: { max: 100 }, required, custom: validateCardNumber }}
        fieldTitle={cardNumberFieldTitle}
    />
    )}
  />

  ...
}
```

To complete the example with validation we need to add server side code which will handle requests from client.
Override `ExecuteCommand` in the `ExtraStepModel` class:

```cs
public override object ExecuteCommand(ExtraCheckoutStepCommandContext context)
{
    var commandName = (string)context.Arguments.GetOrDefault("command");
    if (string.IsNullOrEmpty(commandName))
        throw new ArgumentException("The command is undefined.");

    if (commandName == "validateCardNumber")
    {
        return new
        {
            validationResult = ValidateCardNumber((string)context.Arguments.GetOrDefault("cardNumber"));
        }; // this object will be converted to JSON
    }

    throw new NotSupportedException($"Command {commandName} is not supported.");
}
```

## See also

[New payment service provider](create-payment-extension.md)

[Extension.Api reference](../reference/extension-api.md)

[Extension.Api.SecureInMemoryStorage reference](../reference/extension-api-secureinmemorystorage.md)
