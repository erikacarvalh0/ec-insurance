import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaPasswordResetRepository } from './password-reset-repository.mjs';

test('replaces the previous token only for an active email', async () => {
  const calls = [];
  const repository = createPrismaPasswordResetRepository({ user: { updateMany: async (query) => {
    calls.push(query);
    return { count: 1 };
  } } });
  const expiresAt = new Date('2026-11-16T12:15:00Z');
  assert.equal(await repository.replace({ email: 'broker@example.com', tokenHash: 'digest', expiresAt }), true);
  assert.deepEqual(calls, [{
    where: { email: 'broker@example.com', active: true },
    data: { passwordResetTokenHash: 'digest', passwordResetExpiresAt: expiresAt },
  }]);
});

test('consumes an unexpired token and updates the password in a single conditional write', async () => {
  const calls = [];
  const repository = createPrismaPasswordResetRepository({ user: { updateMany: async (query) => {
    calls.push(query);
    return { count: calls.length === 1 ? 1 : 0 };
  } } });
  const now = new Date('2026-11-16T12:00:00Z');
  const request = { tokenHash: 'digest', passwordHash: 'scrypt-hash', now };
  assert.equal(await repository.consume(request), true);
  assert.equal(await repository.consume(request), false);
  assert.deepEqual(calls[0], {
    where: { active: true, passwordResetTokenHash: 'digest', passwordResetExpiresAt: { gt: now } },
    data: { passwordHash: 'scrypt-hash', passwordResetTokenHash: null, passwordResetExpiresAt: null },
  });
});

test('missing accounts are not eligible and missing persistence is rejected', async () => {
  const repository = createPrismaPasswordResetRepository({ user: { updateMany: async () => ({ count: 0 }) } });
  assert.equal(await repository.replace({ email: 'missing@example.com', tokenHash: 'digest', expiresAt: new Date() }), false);
  assert.throws(() => createPrismaPasswordResetRepository({}), /updateMany/);
});
