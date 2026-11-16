import assert from 'node:assert/strict';
import test from 'node:test';

import { createMockQuotationProvider } from './provider.mjs';

test('returns clearly simulated offers for supported insurance', async () => {
  const provider = createMockQuotationProvider();
  const quote = await provider.submitQuote({
    requestId: 'request-1',
    insuranceType: 'auto',
  });

  assert.equal(quote.requestId, 'request-1');
  assert.equal(quote.simulated, true);
  assert.equal(quote.status, 'completed');
  assert.equal(quote.offers.length, 1);
  assert.equal(quote.offers[0].simulated, true);
  assert.equal(quote.offers[0].premium, null);
});

test('routes unsupported insurance types to manual review', async () => {
  const provider = createMockQuotationProvider();
  const quote = await provider.submitQuote({
    requestId: 'request-2',
    insuranceType: 'unknown',
  });

  assert.equal(quote.status, 'manual_review');
  assert.equal(quote.offers.length, 0);
});

test('rejects missing request identifiers', async () => {
  const provider = createMockQuotationProvider();

  await assert.rejects(
    provider.submitQuote({ insuranceType: 'auto' }),
    { name: 'TypeError' },
  );
});
