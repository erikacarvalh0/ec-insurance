import assert from 'node:assert/strict';
import test from 'node:test';

import { createQuotationOrchestrator } from './orchestrator.mjs';

test('preserves a lead and requests a quote from the provider', async () => {
  const leadStore = {
    create: (input) => ({ id: 'lead-1', status: 'received', ...input }),
  };
  const provider = {
    submitQuote: async (input) => ({
      requestId: input.requestId,
      status: 'completed',
      simulated: true,
      offers: [],
    }),
  };
  const orchestrator = createQuotationOrchestrator({ leadStore, provider });
  const result = await orchestrator.submit({
    idempotencyKey: 'key-1',
    insuranceType: 'auto',
    contact: { name: 'Example Customer' },
  });

  assert.equal(result.lead.id, 'lead-1');
  assert.equal(result.quotation.simulated, true);
});

test('keeps the lead available for manual review when the provider fails', async () => {
  const leadStore = {
    create: () => ({ id: 'lead-2', status: 'received' }),
  };
  const provider = {
    submitQuote: async () => {
      throw new Error('Provider unavailable');
    },
  };
  const orchestrator = createQuotationOrchestrator({ leadStore, provider });
  const result = await orchestrator.submit({ insuranceType: 'travel' });

  assert.equal(result.lead.id, 'lead-2');
  assert.equal(result.quotation.status, 'manual_review');
  assert.equal(result.quotation.offers.length, 0);
});
