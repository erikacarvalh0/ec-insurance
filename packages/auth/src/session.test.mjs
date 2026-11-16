import assert from 'node:assert/strict';
import test from 'node:test';

import { validateSession } from './session.mjs';

test('accepts an unexpired session with supported role', () => {
  assert.equal(validateSession({
    userId: 'user-1',
    role: 'broker',
    expiresAt: '2026-11-17T00:00:00.000Z',
  }, '2026-11-16T00:00:00.000Z'), true);
});

test('rejects expired sessions', () => {
  assert.equal(validateSession({
    userId: 'user-1',
    role: 'manager',
    expiresAt: '2026-11-15T00:00:00.000Z',
  }, '2026-11-16T00:00:00.000Z'), false);
});

test('rejects missing identity or unknown roles', () => {
  assert.equal(validateSession({ role: 'admin', expiresAt: '2026-11-17T00:00:00.000Z' }, '2026-11-16T00:00:00.000Z'), false);
  assert.equal(validateSession({ userId: 'user-1', role: 'guest', expiresAt: '2026-11-17T00:00:00.000Z' }, '2026-11-16T00:00:00.000Z'), false);
});
