import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from './password.mjs';

test('password hashes use random salts and verify valid passwords', async () => {
  const first = await hashPassword('correct horse battery staple');
  const second = await hashPassword('correct horse battery staple');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('correct horse battery staple', first), true);
  assert.equal(await verifyPassword('wrong password', first), false);
});

test('invalid password hashes are rejected safely', async () => {
  assert.equal(await verifyPassword('anything', 'invalid'), false);
  await assert.rejects(hashPassword(''), /password/i);
});
