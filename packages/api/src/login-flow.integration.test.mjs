import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLogin } from './prisma-login-runtime.mjs';
import { createSessionTokenService } from '../../auth/src/token.mjs';
import { hashPassword } from '../../auth/src/password.mjs';

test('broker credentials produce a verifiable role-bound token', async () => {
  const passwordHash = await hashPassword('correct horse');
  const prisma = { user: { findUnique: async ({where}) => where.email === 'broker@example.com' ? { id:'broker-1', role:'BROKER', active:true, passwordHash } : null } };
  const tokens = createSessionTokenService({ secret: 'a'.repeat(64) });
  const login = createPrismaLogin({ prisma, issueToken: tokens.issue });
  const success = await login({method:'POST',body:{email:'BROKER@example.com',password:'correct horse'}});
  assert.equal(success.status,200);
  assert.deepEqual(tokens.verify(success.body.token),{userId:'broker-1',role:'broker'});
  assert.equal((await login({method:'POST',body:{email:'broker@example.com',password:'wrong'}})).status,401);
  assert.equal((await login({method:'POST',body:{email:'missing@example.com',password:'correct horse'}})).status,401);
});
