import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { createPasswordResetService } from './password-reset.mjs';
import { hashPassword, verifyPassword } from './password.mjs';

function fixture() {
  let time = 1000;
  const user = { email: 'broker@example.com', active: true, passwordHash: 'old' };
  const deliveries = [];
  const repository = {
    async replace({ email, tokenHash, expiresAt }) {
      if (email !== user.email || !user.active) return false;
      Object.assign(user, { tokenHash, expiresAt });
      return true;
    },
    async consume({ tokenHash, passwordHash, now }) {
      if (!user.active || user.tokenHash !== tokenHash || user.expiresAt <= now) return false;
      Object.assign(user, { passwordHash, tokenHash: null, expiresAt: null });
      return true;
    },
  };
  const service = createPasswordResetService({
    repository, now: () => time, ttlMilliseconds: 1000,
    deliver: async (message) => deliveries.push(message),
  });
  return { service, user, deliveries, repository, advance: () => { time += 1000; } };
}

test('recovery normalizes email, stores only a digest and replaces previous unique tokens', async () => {
  const { service, user, deliveries } = fixture();
  await service.request({ email: ' Broker@Example.com ' });
  const first = deliveries[0].token;
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(user.tokenHash, createHash('sha256').update(first).digest('hex'));
  assert.equal(user.expiresAt.getTime(), 2000);
  assert.equal(deliveries[0].email, user.email);
  await service.request({ email: user.email });
  assert.notEqual(deliveries[1].token, first);
  assert.equal(await service.reset({ token: first, password: 'replacement' }), false);
});

test('reset changes the password with the existing hash format and permits only one concurrent use', async () => {
  const { service, user, deliveries } = fixture();
  user.passwordHash = await hashPassword('previous');
  await service.request({ email: user.email });
  const request = { token: deliveries[0].token, password: 'replacement' };
  const results = await Promise.all([service.reset(request), service.reset(request)]);
  assert.deepEqual(results.sort(), [false, true]);
  assert.equal(await verifyPassword('replacement', user.passwordHash), true);
  assert.equal(await verifyPassword('previous', user.passwordHash), false);
  assert.equal(user.tokenHash, null);
  assert.equal(user.expiresAt, null);
  assert.equal(await service.reset(request), false);
});

test('expired, tampered and disabled-account tokens cannot change passwords', async () => {
  for (const scenario of ['expired', 'tampered', 'disabled']) {
    const { service, user, deliveries, advance } = fixture();
    await service.request({ email: user.email });
    let token = deliveries[0].token;
    if (scenario === 'expired') advance();
    if (scenario === 'tampered') token = `${token[0] === 'A' ? 'B' : 'A'}${token.slice(1)}`;
    if (scenario === 'disabled') user.active = false;
    assert.equal(await service.reset({ token, password: 'replacement' }), false);
    assert.equal(user.passwordHash, 'old');
  }
});

test('recovery returns the same response for known, unknown, disabled and failed deliveries', async () => {
  const { service, user, deliveries, repository } = fixture();
  const expected = await service.request({ email: user.email });
  assert.deepEqual(await service.request({ email: 'unknown@example.com' }), expected);
  user.active = false;
  assert.deepEqual(await service.request({ email: user.email }), expected);
  assert.equal(deliveries.length, 1);
  const failing = createPasswordResetService({ repository, deliver: async () => { throw new Error('mail unavailable'); } });
  user.active = true;
  assert.deepEqual(await failing.request({ email: user.email }), expected);
  repository.replace = async () => { throw new Error('database unavailable'); };
  assert.deepEqual(await failing.request({ email: user.email }), expected);
  assert.equal(JSON.stringify(expected).includes(deliveries[0].token), false);
});

test('invalid input cannot consume a valid token', async () => {
  const { service, user, deliveries } = fixture();
  await service.request({ email: user.email });
  const token = deliveries[0].token;
  for (const password of ['', null, 'é'.repeat(513)]) {
    assert.equal(await service.reset({ token, password }), false);
  }
  for (const invalid of [undefined, '', 'x'.repeat(43), `${token}=`]) {
    assert.equal(await service.reset({ token: invalid, password: 'replacement' }), false);
  }
  assert.equal(await service.reset({ token, password: 'replacement' }), true);
});
