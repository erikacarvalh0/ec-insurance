import assert from 'node:assert/strict';
import test from 'node:test';
import { createCredentialVerifier } from './credentials.mjs';

test('returns an authenticated actor for active account with correct password', async () => {
  const verify = createCredentialVerifier({
    users: { findByEmail: async () => ({ id: 'u1', role: 'BROKER', teamId: 'team1', active: true, passwordHash: 'hash' }) },
    verifyPassword: async (password, hash) => password === 'correct' && hash === 'hash',
  });
  assert.deepEqual(await verify({ email: 'broker@example.com', password: 'correct' }), { userId: 'u1', role: 'broker', teamId: 'team1' });
  assert.equal(await verify({ email: 'broker@example.com', password: 'wrong' }), null);
});

test('rejects disabled accounts and unsupported roles', async () => {
  const verify = createCredentialVerifier({
    users: { findByEmail: async () => ({ id: 'u1', role: 'BROKER', active: false, passwordHash: 'hash' }) },
    verifyPassword: async () => true,
  });
  assert.equal(await verify({ email: 'broker@example.com', password: 'correct' }), null);
});
