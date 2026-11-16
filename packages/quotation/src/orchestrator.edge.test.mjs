import assert from 'node:assert/strict';
import test from 'node:test';

import { createQuotationOrchestrator } from './orchestrator.mjs';

test('rejects missing dependencies', () => {
  assert.throws(
    () => createQuotationOrchestrator({ leadStore: null, provider: null }),
    { name: 'TypeError' },
  );
});

test('does not invoke the provider when lead creation fails', async () => {
  let providerCalled = false;
  const orchestrator = createQuotationOrchestrator({
    leadStore: {
      create: async () => {
        throw new Error('Lead storage unavailable');
      },
    },
    provider: {
      submitQuote: async () => {
        providerCalled = true;
      },
    },
  });

  await assert.rejects(orchestrator.submit({}), /Lead storage unavailable/);
  assert.equal(providerCalled, false);
});
