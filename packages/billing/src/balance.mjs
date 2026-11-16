function validateAmount(amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError('Amounts must be non-negative safe integers in cents.');
  }
}

export function calculateInvoiceBalance(totalCents, paymentAmountsCents) {
  validateAmount(totalCents);

  if (!Array.isArray(paymentAmountsCents)) {
    throw new TypeError('Payment amounts must be an array.');
  }

  let totalPaidCents = 0;
  for (const amount of paymentAmountsCents) {
    validateAmount(amount);
    totalPaidCents += amount;
    if (!Number.isSafeInteger(totalPaidCents)) {
      throw new RangeError('Total payments exceed the safe integer range.');
    }
  }

  return {
    totalPaidCents,
    amountDueCents: Math.max(0, totalCents - totalPaidCents),
    creditCents: Math.max(0, totalPaidCents - totalCents),
  };
}
