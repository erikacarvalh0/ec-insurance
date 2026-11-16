import assert from 'node:assert/strict';
import test from 'node:test';

import { createPersistentApiServer } from './persistent-server.mjs';

test('accepts intake and persists through an injected repository', async (t) => {
  const writes = [];
  const server = createPersistentApiServer({
    leadRepository: { create: async (input) => { writes.push(input); return { id: 'db-lead-1' }; } },
    checkDatabase: async () => true,
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const response = await fetch(`${base}/api/intake`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      insuranceType: 'auto',
      idempotencyKey: 'key-1',
      contact: { name: 'Jane', email: 'jane@example.com', phone: '11987654321' },
      details: { vehicleModel: 'Sedan', vehicleYear: 2024 },
    }),
  });

  assert.equal(response.status, 201);
  assert.equal((await response.json()).lead.id, 'db-lead-1');
  assert.equal(writes.length, 1);
  assert.equal((await fetch(`${base}/health`)).status, 200);
});

test('reports unavailable when database readiness fails', async (t) => {
  const server = createPersistentApiServer({
    leadRepository: { create: async () => ({}) },
    checkDatabase: async () => false,
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
  assert.equal(response.status, 503);
});
