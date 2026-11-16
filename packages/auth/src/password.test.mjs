import assert from 'node:assert/strict';
import { scryptSync } from 'node:crypto';
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

test('password hashing and verification enforce the same UTF-8 byte limit', async () => {
  const password = 'é'.repeat(512);
  const encoded = await hashPassword(password);
  assert.equal(await verifyPassword(password, encoded), true);

  const oversized = `${password}é`;
  await assert.rejects(hashPassword(oversized), /password/i);
  const salt = Buffer.alloc(32, 1);
  const key = scryptSync(oversized, salt, 64);
  const oversizedHash = `scrypt:v1:${salt.toString('base64url')}:${key.toString('base64url')}`;
  assert.equal(await verifyPassword(oversized, oversizedHash), false);
});

test('accepts exactly 1024 UTF-8 bytes in mixed ASCII and emoji passwords', async () => {
  const password = 'a'.repeat(1020) + '😀';
  const hash = await hashPassword(password);
  assert.equal(await verifyPassword(password, hash), true);
  const oversized = password + 'a';
  await assert.rejects(hashPassword(oversized), /password/i);
  assert.equal(await verifyPassword(oversized, hash), false);
});
