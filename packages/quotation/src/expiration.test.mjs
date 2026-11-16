import assert from 'node:assert/strict';
import test from 'node:test';

import { getQuotationValidity } from './expiration.mjs';

test('returns expired when expiration date has passed', () => {
  assert.equal(getQuotationValidity({
    expiresAt: '2026-11-15T00:00:00.000Z',
    now: '2026-11-16T00:00:00.000Z',
  }), 'expired');
});

test('returns valid for future expiration date', () => {
  assert.equal(getQuotationValidity({
    expiresAt: '2026-11-17T00:00:00.000Z',
    now: '2026-11-16T00:00:00.000Z',
  }), 'valid');
});

test('returns unknown for simulated quotes without expiry', () => {
  assert.equal(getQuotationValidity({
    expiresAt: null,
    now: '2026-11-16T00:00:00.000Z',
  }), 'unknown');
});

test('rejects invalid timestamps', () => {
  assert.throws(() => getQuotationValidity({
    expiresAt: 'not-a-date',
    now: '2026-11-16T00:00:00.000Z',
  }), TypeError);
});
