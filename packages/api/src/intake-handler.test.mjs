import assert from 'node:assert/strict';
import test from 'node:test';

import { createIntakeHandler } from './intake-handler.mjs';

test('accepts valid submissions with 201', async () => {
  const handler = createIntakeHandler({
    submit: async () => ({ success: true, lead: { id: 'lead-1' }, quotation: { simulated: true } }),
  });

  const response = await handler({ method: 'POST', body: { insuranceType: 'auto' } });
  assert.equal(response.status, 201);
  assert.equal(response.body.lead.id, 'lead-1');
});

test('rejects unsupported methods with 405', async () => {
  const handler = createIntakeHandler({ submit: async () => ({ success: true }) });
  const response = await handler({ method: 'GET' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.Allow, 'POST');
});

test('returns 422 for validation errors', async () => {
  const handler = createIntakeHandler({
    submit: async () => ({ success: false, errors: ['contact.email'] }),
  });
  const response = await handler({ method: 'POST', body: {} });
  assert.equal(response.status, 422);
  assert.deepEqual(response.body.errors, ['contact.email']);
});

test('does not leak internal exception details', async () => {
  const handler = createIntakeHandler({
    submit: async () => { throw new Error('secret database credential'); },
  });
  const response = await handler({ method: 'POST', body: {} });
  assert.equal(response.status, 500);
  assert.doesNotMatch(JSON.stringify(response), /secret database credential/);
});
