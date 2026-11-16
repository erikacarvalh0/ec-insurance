import assert from 'node:assert/strict';
import test from 'node:test';
import { createLoginHandler } from './login.mjs';

test('issues a signed session only for verified credentials', async () => {
  const login = createLoginHandler({
    verifyCredentials: async ({ email, password }) =>
      email === 'broker@example.com' && password === 'correct' ? { userId: 'broker-1', role: 'broker' } : null,
    issueToken: (actor) => `signed:${actor.userId}`,
  });
  const result = await login({ method: 'POST', body: { email: 'broker@example.com', password: 'correct' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.token, 'signed:broker-1');
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.equal((await login({ method: 'POST', body: { email: 'broker@example.com', password: 'bad' } })).status, 401);
});

test('rejects malformed login requests without leaking credentials', async () => {
  const login = createLoginHandler({ verifyCredentials: async () => null, issueToken: () => 'token' });
  assert.equal((await login({ method: 'GET' })).status, 405);
  assert.equal((await login({ method: 'POST', body: { email: 'invalid', password: '' } })).status, 400);
});
