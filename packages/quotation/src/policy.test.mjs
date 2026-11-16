import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeQuotation } from './policy.mjs';

test('marks all mock offers as simulated', () => {
  const quote = normalizeQuotation({
    requestId: 'request-1',
    status: 'completed',
    simulated: true,
    offers: [{ id: 'offer-1', premium: null }],
  });

  assert.equal(quote.offers[0].simulated, true);
  assert.equal(quote.disclaimer, 'Simulation only. Not a binding insurance offer.');
});

test('does not publish unverified prices from mock providers', () => {
  const quote = normalizeQuotation({
    requestId: 'request-2',
    status: 'completed',
    simulated: true,
    offers: [{ id: 'offer-2', premium: 123 }],
  });

  assert.equal(quote.offers[0].premium, null);
});

test('sends malformed provider responses to manual review', () => {
  const quote = normalizeQuotation(null);
  assert.equal(quote.status, 'manual_review');
  assert.deepEqual(quote.offers, []);
});

test('requires an explicit boolean simulation flag before publishing offers', () => {
  for (const simulated of [undefined, null, false, 'false', 'true', 1, {}, []]) {
    const quote = normalizeQuotation({
      requestId: 'request-3',
      status: 'completed',
      simulated,
      offers: [{ id: 'offer-3', premium: 123 }],
    });

    assert.deepEqual(quote, {
      requestId: 'request-3',
      status: 'manual_review',
      simulated: false,
      offers: [],
    });
  }
});
