import assert from 'node:assert/strict';
import test from 'node:test';
import { createSessionTokenService } from './token.mjs';

const secret = 'a-long-random-test-secret-that-is-more-than-32-bytes';
const service = createSessionTokenService({ secret, now: () => Date.parse('2026-11-16T00:00:00Z') });

test('issues and verifies a signed, expiring broker session', () => {
  const token = service.issue({ userId: 'broker-1', role: 'broker', teamId: 'team-1' }, 3600);
  assert.deepEqual(service.verify(token), {
    userId: 'broker-1', role: 'broker', teamId: 'team-1',
    expiresAt: '2026-11-16T01:00:00.000Z',
  });
});

test('rejects tampered, malformed, expired and unauthorized sessions', () => {
  const token = service.issue({ userId: 'broker-1', role: 'broker' }, 1);
  assert.equal(service.verify(token + 'x'), null);
  assert.equal(service.verify('invalid'), null);
  assert.equal(createSessionTokenService({ secret, now: () => Date.parse('2026-11-17T00:00:00Z') }).verify(token), null);
  assert.throws(() => service.issue({ userId: 'broker-1', role: 'visitor' }), /Invalid/);
});

test('requires a strong signing secret', () => {
  assert.throws(() => createSessionTokenService({ secret: 'short' }), /secret/);
});
