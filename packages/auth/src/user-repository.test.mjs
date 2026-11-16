import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaUserRepository } from './user-repository.mjs';

test('looks up broker by normalized email without exposing password hash', async () => {
  const calls = [];
  const repository = createPrismaUserRepository({ user: { findUnique: async (query) => {
    calls.push(query);
    return { id: 'u1', email: 'broker@example.com', role: 'BROKER', passwordHash: 'secret', teamId: 't1' };
  } } });
  const user = await repository.findByEmail(' Broker@Example.com ');
  assert.equal(user.passwordHash, 'secret');
  assert.equal(calls[0].where.email, 'broker@example.com');
});

test('rejects missing Prisma user model', () => {
  assert.throws(() => createPrismaUserRepository({}), /user/i);
});
