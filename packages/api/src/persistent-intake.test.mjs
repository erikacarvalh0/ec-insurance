import assert from 'node:assert/strict';
import test from 'node:test';

import { createPersistentIntakeHandler } from './persistent-intake.mjs';

const input = {
  insuranceType: 'auto',
  idempotencyKey: 'req-1',
  contact: { name: 'Jane', email: 'jane@example.com', phone: '11987654321' },
  details: { vehicleModel: 'Sedan', vehicleYear: 2024 },
};

test('validates and persists an intake using the lead repository', async () => {
  const writes = [];
  const handler = createPersistentIntakeHandler({
    leadRepository: { create: async (data) => { writes.push(data); return { id: 'lead-1' }; } },
  });
  const response = await handler({ method: 'POST', body: input });
  assert.equal(response.status, 201);
  assert.deepEqual(response.body, { success: true, lead: { id: 'lead-1' } });
  assert.equal(writes.length, 1);
});

test('does not write invalid intake data', async () => {
  let writes = 0;
  const handler = createPersistentIntakeHandler({
    leadRepository: { create: async () => { writes++; } },
  });
  const response = await handler({ method: 'POST', body: { insuranceType: 'auto' } });
  assert.equal(response.status, 422);
  assert.equal(writes, 0);
});

test('does not expose persistence errors to clients', async () => {
  const handler = createPersistentIntakeHandler({
    leadRepository: { create: async () => { throw new Error('postgresql://secret'); } },
  });
  const response = await handler({ method: 'POST', body: input });
  assert.equal(response.status, 500);
  assert.doesNotMatch(JSON.stringify(response), /postgresql/);
});
