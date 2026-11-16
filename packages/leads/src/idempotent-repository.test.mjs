import assert from 'node:assert/strict';
import test from 'node:test';

import { createIdempotentLeadRepository } from './idempotent-repository.mjs';

const input = { idempotencyKey: 'key-1', insuranceType: 'auto' };

test('reuses a persisted lead for a repeated idempotency key', async () => {
  let creates = 0;
  const repository = createIdempotentLeadRepository({
    findUnique: async () => ({ id: 'lead-1' }),
    create: async () => { creates += 1; },
  });

  const result = await repository.create(input);
  assert.equal(result.id, 'lead-1');
  assert.equal(creates, 0);
});

test('creates a lead when the key is new', async () => {
  const repository = createIdempotentLeadRepository({
    findUnique: async () => null,
    create: async () => ({ id: 'lead-2' }),
  });

  assert.deepEqual(await repository.create(input), { id: 'lead-2' });
});

test('requires a key and both repository methods', async () => {
  assert.throws(() => createIdempotentLeadRepository({}), TypeError);
  const repository = createIdempotentLeadRepository({
    findUnique: async () => null,
    create: async () => ({ id: 'lead-3' }),
  });
  await assert.rejects(repository.create({}), TypeError);
});
