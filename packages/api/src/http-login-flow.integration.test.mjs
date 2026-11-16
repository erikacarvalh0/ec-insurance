import assert from 'node:assert/strict';
import test from 'node:test';
import { createSecureApiServer } from './secure-server.mjs';
import { createPrismaLogin } from './prisma-login-runtime.mjs';
import { createSessionTokenService } from '../../auth/src/token.mjs';
import { hashPassword } from '../../auth/src/password.mjs';

test('POST /api/login authenticates a broker and returns a signed token', async (t) => {
  const passwordHash = await hashPassword('correct password');
  const prisma = { user: { findUnique: async () => ({ id: 'broker-1', role: 'BROKER', active: true, passwordHash }) } };
  const tokens = createSessionTokenService({ secret: 'x'.repeat(64) });
  const server = createSecureApiServer({
    leadRepository: { create: async () => ({ id: 'lead-1' }) }, checkDatabase: async () => true,
    verifyToken: tokens.verify, leadListRepository: { list: async () => [] },
    login: createPrismaLogin({ prisma, issueToken: tokens.issue }),
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'broker@example.com', password: 'correct password' }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(tokens.verify(result.token), { userId: 'broker-1', role: 'broker' });
});
