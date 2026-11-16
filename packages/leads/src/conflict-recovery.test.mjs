import assert from 'node:assert/strict';
import test from 'node:test';

import { createConflictSafeLeadRepository } from './conflict-recovery.mjs';

const input = { idempotencyKey: 'request-1' };

test('creates new lead when no conflict occurs', async () => {
  const repository = createConflictSafeLeadRepository({
    create: async () => ({ id: 'new' }),
    findUnique: async () => null,
  });

  assert.deepEqual(await repository.create(input), { id: 'new' });
});

test('recovers the original lead after Prisma unique constraint conflict', async () => {
  const repository = createConflictSafeLeadRepository({
    create: async () => { throw { code: 'P2002', meta: { target: ['idempotencyKey'] } }; },
    findUnique: async () => ({ id: 'existing' }),
  });

  assert.deepEqual(await repository.create(input), { id: 'existing' });
});

test('does not swallow unrelated database errors', async () => {
  const repository = createConflictSafeLeadRepository({
    create: async () => { throw new Error('database offline'); },
    findUnique: async () => null,
  });

  await assert.rejects(repository.create(input), /database offline/);
});

test('rejects missing idempotency keys', async () => {
  const repository = createConflictSafeLeadRepository({
    create: async () => ({}),
    findUnique: async () => null,
  });

  await assert.rejects(repository.create({}), TypeError);
});
