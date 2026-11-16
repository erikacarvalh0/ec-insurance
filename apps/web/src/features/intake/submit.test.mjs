import assert from 'node:assert/strict';
import test from 'node:test';

import { submitInsuranceIntake } from './submit.mjs';

test('posts nested JSON with idempotency key and returns successful result', async () => {
  const requests = [];
  const fetcher = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 201, json: async () => ({ success: true, lead: { id: 'lead-1' } }) };
  };
  const result = await submitInsuranceIntake({
    insuranceType: 'auto', name: 'Jane', email: 'jane@example.com',
    phone: '11987654321', vehicleModel: 'Sedan', vehicleYear: '2024',
  }, { fetcher, idempotencyKey: 'request-1' });
  assert.equal(result.lead.id, 'lead-1');
  assert.equal(requests[0].url, '/api/intake');
  assert.equal(requests[0].options.headers['Content-Type'], 'application/json');
  assert.equal(JSON.parse(requests[0].options.body).details.vehicleYear, 2024);
});

test('throws a safe error when the API rejects a request', async () => {
  await assert.rejects(
    submitInsuranceIntake({ insuranceType: 'auto' }, {
      idempotencyKey: 'request-2',
      fetcher: async () => ({ ok: false, status: 422, json: async () => ({ errors: ['contact.email'] }) }),
    }),
    /contact.email/,
  );
});
