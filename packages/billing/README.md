# Billing

`calculateInvoiceBalance(totalCents, paymentAmountsCents)` in `src/balance.mjs`
calculates an invoice balance from its total and recorded payment amounts. All
amounts must use the same currency and be non-negative safe integers in cents.
The payment array is required; use `[]` for an unpaid invoice.

The result contains `totalPaidCents`, `amountDueCents`, and `creditCents`.
Overpayments produce a credit and zero amount due. Invalid amounts or a payment
sum beyond JavaScript's safe integer range throw `RangeError`; a non-array payment
argument throws `TypeError`. Inputs are never changed.

```js
calculateInvoiceBalance(10001, [3333, 3333]);
// { totalPaidCents: 6666, amountDueCents: 3335, creditCents: 0 }
```

This is a calculation utility only; it does not collect payments, persist invoices,
or issue refunds. Callers supply recorded payments, excluding failed or voided
transactions. Currency conversion and refund accounting are outside this contract.

Run its tests with `node --test packages/billing/src/balance.test.mjs`.
