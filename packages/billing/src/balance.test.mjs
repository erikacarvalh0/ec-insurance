import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateInvoiceBalance } from './balance.mjs';

test('reports the full balance for an unpaid invoice', () => {
  assert.deepEqual(calculateInvoiceBalance(10001, []), {
    totalPaidCents: 0,
    amountDueCents: 10001,
    creditCents: 0,
  });
});

test('sums partial payments without losing cents or changing the payments', () => {
  const payments = Object.freeze([3333, 3333]);

  assert.deepEqual(calculateInvoiceBalance(10001, payments), {
    totalPaidCents: 6666,
    amountDueCents: 3335,
    creditCents: 0,
  });
});

test('reports settled and zero-value invoices with no balance or credit', () => {
  for (const [total, payments] of [[10001, [5000, 5001]], [0, []]]) {
    assert.deepEqual(calculateInvoiceBalance(total, payments), {
      totalPaidCents: total,
      amountDueCents: 0,
      creditCents: 0,
    });
  }
});

test('reports overpayment as credit instead of a negative amount due', () => {
  assert.deepEqual(calculateInvoiceBalance(10000, [10001]), {
    totalPaidCents: 10001,
    amountDueCents: 0,
    creditCents: 1,
  });
});

test('rejects invalid invoice totals and payment amounts', () => {
  const invalidAmounts = [-1, 1.5, NaN, Infinity, '100', null, undefined,
    Number.MAX_SAFE_INTEGER + 1];

  for (const amount of invalidAmounts) {
    assert.throws(() => calculateInvoiceBalance(amount, []), RangeError);
    assert.throws(() => calculateInvoiceBalance(100, [amount]), RangeError);
  }
});

test('requires an array of payments and rejects missing entries', () => {
  for (const payments of [undefined, null, '100', {}, 100]) {
    assert.throws(() => calculateInvoiceBalance(100, payments), TypeError);
  }
  assert.throws(() => calculateInvoiceBalance(100, new Array(1)), RangeError);
});

test('accepts the safe integer boundary and rejects payment sum overflow', () => {
  assert.equal(
    calculateInvoiceBalance(Number.MAX_SAFE_INTEGER, [Number.MAX_SAFE_INTEGER]).amountDueCents,
    0,
  );
  assert.throws(
    () => calculateInvoiceBalance(100, [Number.MAX_SAFE_INTEGER, 1]),
    RangeError,
  );
});
