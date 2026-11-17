import assert from 'node:assert/strict';
import test from 'node:test';
import { validateMoney, sumMoney } from './money.mjs';

test('validates nonnegative integer cents and BRL currency', () => {
  assert.deepEqual(validateMoney({ cents: 1234, currency: 'BRL' }), { cents: 1234, currency: 'BRL' });
  for (const cents of [-1, 1.5, NaN, Infinity, '100']) assert.throws(() => validateMoney({ cents, currency: 'BRL' }));
  assert.throws(() => validateMoney({ cents: 100, currency: 'USD' }));
});

test('sums cents exactly and rejects overflow', () => {
  assert.deepEqual(sumMoney([{ cents: 10, currency: 'BRL' }, { cents: 20, currency: 'BRL' }]), { cents: 30, currency: 'BRL' });
  assert.throws(() => sumMoney([{ cents: Number.MAX_SAFE_INTEGER, currency: 'BRL' }, { cents: 1, currency: 'BRL' }]));
});
