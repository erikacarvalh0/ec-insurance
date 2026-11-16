import assert from 'node:assert/strict';
import test from 'node:test';

import { createApiServer } from './server.mjs';

test('serves health and valid insurance submissions over HTTP', async (t) => {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);

  const response = await fetch(`${base}/api/intake`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      idempotencyKey: 'req-1',
      insuranceType: 'auto',
      contact: { name: 'Example Customer', email: 'test@example.com', phone: '11987654321' },
      details: { vehicleModel: 'Sedan', vehicleYear: 2023 },
    }),
  });

  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.quotation.simulated, true);
  assert.equal(result.quotation.offers[0].premium, null);
});

test('rejects malformed JSON without exposing internals', async (t) => {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${base}/api/intake`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{invalid',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid JSON request' });
});
