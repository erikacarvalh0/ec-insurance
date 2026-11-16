import assert from 'node:assert/strict';
import test from 'node:test';
import { createLoginRateLimiter } from './rate-limit.mjs';

test('blocks repeated attempts within window and resets after expiry', () => {
  let now = 1000;
  const limiter = createLoginRateLimiter({ maxAttempts: 2, windowMs: 60000, now: () => now });
  assert.equal(limiter.allow('192.0.2.1'), true);
  assert.equal(limiter.allow('192.0.2.1'), true);
  assert.equal(limiter.allow('192.0.2.1'), false);
  assert.equal(limiter.allow('192.0.2.2'), true);
  now += 60001;
  assert.equal(limiter.allow('192.0.2.1'), true);
});

test('rejects invalid settings and keys', () => {
  assert.throws(() => createLoginRateLimiter({ maxAttempts: 0 }), /maxAttempts/);
  const limiter = createLoginRateLimiter();
  assert.equal(limiter.allow(''), false);
});
