import assert from 'node:assert/strict';
import test from 'node:test';

import { createPrismaLeadRepository } from './repository.mjs';

test('creates leads using injected Prisma client', async () => {
  const calls = [];
  const repository = createPrismaLeadRepository({
    lead: {
      create: async (args) => {
        calls.push(args);
        return { id: 'lead-1', ...args.data };
      },
    },
  });

  const result = await repository.create({
    idempotencyKey: 'key-1',
    insuranceType: 'auto',
    contact: { name: 'Example', email: 'example@example.com', phone: '11987654321' },
  });

  assert.equal(result.id, 'lead-1');
  assert.equal(result.insuranceType, 'auto');
  assert.equal(calls[0].data.insuranceType, 'AUTO');
});

test('rejects clients without a lead model', () => {
  assert.throws(() => createPrismaLeadRepository({}), TypeError);
});

test('does not expose persistence contact columns to callers', async () => {
  const repository = createPrismaLeadRepository({
    lead: {
      create: async ({ data }) => ({ id: 'lead-2', ...data }),
    },
  });

  const result = await repository.create({
    idempotencyKey: 'key-2',
    insuranceType: 'travel',
    contact: { name: 'Example', email: 'example@example.com', phone: '11987654321' },
  });

  assert.equal(Object.hasOwn(result, 'contactEmail'), false);
  assert.equal(result.contact.email, 'example@example.com');
});
