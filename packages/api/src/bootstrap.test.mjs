import assert from 'node:assert/strict';
import test from 'node:test';

import { createPrismaApiRuntime } from './bootstrap.mjs';

test('creates a persistent HTTP server and disconnects Prisma on shutdown', async (t) => {
  let disconnected = 0;
  const prisma = {
    lead: {
      create: async ({ data }) => ({ id: 'db-lead-1', ...data }),
    },
    $queryRawUnsafe: async () => [{ value: 1 }],
    $disconnect: async () => { disconnected += 1; },
  };
  const runtime = createPrismaApiRuntime({ prisma });
  await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await runtime.close(); });
  const base = `http://127.0.0.1:${runtime.server.address().port}`;
  assert.equal((await fetch(`${base}/health`)).status, 200);

  const response = await fetch(`${base}/api/intake`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      idempotencyKey: 'req-1', insuranceType: 'auto',
      contact: { name: 'Jane', email: 'jane@example.com', phone: '11987654321' },
      details: { vehicleModel: 'Sedan', vehicleYear: 2024 },
    }),
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).lead.id, 'db-lead-1');
  assert.equal(disconnected, 0);
});

test('rejects a Prisma client without a lead model', () => {
  assert.throws(() => createPrismaApiRuntime({ prisma: {} }), TypeError);
});
