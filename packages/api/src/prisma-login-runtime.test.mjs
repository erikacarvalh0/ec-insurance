import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLogin } from './prisma-login-runtime.mjs';
import { hashPassword } from '../../auth/src/password.mjs';

test('creates login handler using Prisma users and signed token service', async () => {
  const passwordHash = await hashPassword('correct password');
  const login = createPrismaLogin({
    prisma: { user: { findUnique: async () => ({ id: 'broker-1', role: 'BROKER', active: true, passwordHash }) } },
    issueToken: (actor) => `token-${actor.userId}`,
  });
  const result = await login({ method: 'POST', body: { email: 'broker@example.com', password: 'correct password' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.token, 'token-broker-1');
  assert.equal((await login({ method: 'POST', body: { email: 'broker@example.com', password: 'bad' } })).status, 401);
});
