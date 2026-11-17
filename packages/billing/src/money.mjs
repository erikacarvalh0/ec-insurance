export function validateMoney({ cents, currency } = {}) {
  if (!Number.isSafeInteger(cents) || cents < 0 || currency !== 'BRL') {
    throw new TypeError('Valid BRL integer cents are required');
  }
  return { cents, currency };
}

export function sumMoney(amounts) {
  if (!Array.isArray(amounts)) throw new TypeError('Amounts must be an array');
  let cents = 0;
  for (const amount of amounts) {
    cents += validateMoney(amount).cents;
    if (!Number.isSafeInteger(cents)) throw new RangeError('Monetary total exceeds safe integer range');
  }
  return { cents, currency: 'BRL' };
}
