import assert from 'node:assert/strict';
import test from 'node:test';
import { createLoginRateLimiter } from './rate-limit.mjs';

test('evicts expired keys to bound limiter memory usage', () => {
  let time = 0;
  const limiter = createLoginRateLimiter({ maxAttempts: 1, windowMs: 10, now: () => time, maxKeys: 2 });
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('b'), true);
  assert.equal(limiter.allow('c'), false);
  time = 11;
  assert.equal(limiter.allow('c'), true);
  assert.equal(limiter.allow('a'), true);
});

test('validates limiter key capacity', () => {
  assert.throws(() => createLoginRateLimiter({ maxKeys: 0 }), /maxKeys/);
});
