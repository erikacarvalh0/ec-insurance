import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { createSessionTokenService } from './token.mjs';

test('signed session verifies and rejects tampering', () => {
  const tokens = createSessionTokenService({ secret: 'a'.repeat(32), now: () => Date.parse('2026-11-16T00:00:00Z') });
  const token = tokens.issue({ userId: 'broker-1', role: 'broker' });
  assert.equal(tokens.verify(token).userId, 'broker-1');
  assert.equal(tokens.verify(token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')), null);
});

test('expired sessions and weak signing keys are rejected', () => {
  assert.throws(() => createSessionTokenService({ secret: 'weak' }), /secret/i);
  let current = Date.parse('2026-11-16T00:00:00Z');
  const tokens = createSessionTokenService({ secret: 'b'.repeat(32), now: () => current, ttlSeconds: 60 });
  const token = tokens.issue({ userId: 'broker-1', role: 'broker' });
  current += 61_000;
  assert.equal(tokens.verify(token), null);
});

test('session verification rejects tokens when the clock cannot validate time claims', () => {
  let current = 100_000;
  const tokens = createSessionTokenService({ secret: 'b'.repeat(32), now: () => current, ttlSeconds: 60 });
  const token = tokens.issue({ userId: 'broker-1', role: 'broker' });
  assert.deepEqual(tokens.verify(token), { userId: 'broker-1', role: 'broker' });

  for (const invalidTime of [NaN, Infinity, -Infinity, undefined, Number.MAX_VALUE]) {
    current = invalidTime;
    assert.equal(tokens.verify(token), null);
  }
});

test('session tokens preserve a valid optional team claim', () => {
  const tokens = createSessionTokenService({ secret: 'c'.repeat(32) });
  const actor = { userId: 'broker-1', role: 'broker', teamId: 'team-1' };
  assert.deepEqual(tokens.verify(tokens.issue(actor)), actor);
});

test('issuing session tokens rejects invalid timestamp claims', () => {
  for (const current of [NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER * 1000]) {
    const tokens = createSessionTokenService({ secret: 'c'.repeat(32), now: () => current });
    assert.throws(() => tokens.issue({ userId: 'broker-1', role: 'broker' }), TypeError);
  }
});

test('issuing session tokens rejects expiry beyond the safe integer range', () => {
  const tokens = createSessionTokenService({
    secret: 'c'.repeat(32), now: () => 100_000, ttlSeconds: Number.MAX_SAFE_INTEGER,
  });
  assert.throws(() => tokens.issue({ userId: 'broker-1', role: 'broker' }), TypeError);
});

test('issuing session tokens rejects malformed team claims', () => {
  const tokens = createSessionTokenService({ secret: 'c'.repeat(32) });
  for (const teamId of [null, '', 42, false, [], {}]) {
    assert.throws(() => tokens.issue({ userId: 'broker-1', role: 'broker', teamId }), TypeError);
  }
});

test('verifying signed session tokens rejects malformed team claims', () => {
  const secret = 'c'.repeat(32);
  const tokens = createSessionTokenService({ secret, now: () => 100_000 });
  for (const teamId of [null, '', 42, false, [], {}]) {
    const payload = Buffer.from(JSON.stringify({
      sub: 'broker-1', role: 'broker', teamId, iat: 100, exp: 200,
    })).toString('base64url');
    const signature = createHmac('sha256', secret).update(payload).digest('base64url');
    assert.equal(tokens.verify(`${payload}.${signature}`), null);
  }
});

test('sessions issued in the same second have distinct identifiers', () => {
  const tokens = createSessionTokenService({ secret: 'a'.repeat(32), now: () => 100000 });
  const actor = { userId: 'broker-1', role: 'broker' };
  const first = tokens.issue(actor);
  const second = tokens.issue(actor);
  assert.notEqual(first, second);
  assert.deepEqual(tokens.verify(first), actor);
  assert.deepEqual(tokens.verify(second), actor);
});

test('exposes authenticated session metadata for revocation checks', () => {
  const tokens = createSessionTokenService({ secret: 'a'.repeat(32), now: () => 100000 });
  const actor = { userId: 'broker-1', role: 'broker' };
  const token = tokens.issue(actor);
  const claims = tokens.verifySession(token);
  assert.deepEqual(claims.actor, actor);
  assert.match(claims.sessionId, /^[a-f0-9-]{36}$/);
  assert.equal(claims.expiresAt, 3700);
  assert.equal(tokens.verifySession(token + 'x'), null);
});
