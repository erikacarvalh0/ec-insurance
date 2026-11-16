import assert from 'node:assert/strict';
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
