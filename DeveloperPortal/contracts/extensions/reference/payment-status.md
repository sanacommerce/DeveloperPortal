# PaymentStatus reference

Sana Extensions framework provides `PaymentStatus` enum which defines the following
payment statuses to use in your payment extensions:

## New

The initial status which is set for any payment transaction in the beginning of
the payment process. Indicates that payment transaction was not processed yet.

## InProgress

Indicates that the web store payment process is finished, but the payment transaction
is still in progress. This status can be set, for example, for payment transaction which
was authorized but not yet captured, but it really depends on specific payment provider's
implementation.

## Paid

Indicates that the payment has been successfully completed, that is the transaction has been
successfully captured or charged.

## Cancelled

Indicates that the payment process or the corresponding payment transaction has been canceled
either by the user or by the payment gateway.

## Error

Indicates that there is an error in the payment process on processing payment transaction
and status can't be determined.
This status prevents further status updates either for current transactions or previous ones for the
same order.
Because of this, framework will also clear the basket to prevent new transactions for the order
and notify shop administrator to process the order/transaction manually.

Because of the above, this status should be used carefully only in cases when either:
- any further processing by extension is not possible (e.g. configuration became broken or payment
gateway sent new unexpected status)
- or there are possible malicious actions by the user (e.g. extension received status from the gateway
that fraud protection blocked a transaction) or some unknown error occurred so that extension can't
be sure whether customer hasn’t been charged yet.

This status should not be used in case:
- an error occurs before user has been redirected to payment page or there is an error in
configuration which doesn't allow to pay order in-place, the `New` status should be used instead.
- there was an error with payment (e.g. from card number is used) but the extension
can be sure that customer account hasn't being charged, the `Cancelled` status should be used instead.

## See also

[New payment service provider](../how-to/create-payment-extension.md)
