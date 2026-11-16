import assert from 'node:assert/strict';
import test from 'node:test';
import { isSessionTokenActive } from './session.mjs';

function token(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url') + '.signature';
}

test('accepts only unexpired signed token payloads', () => {
  const now = 1_700_000_000_000;
  assert.equal(isSessionTokenActive(token({ exp: 1_700_000_100 }), now), true);
  assert.equal(isSessionTokenActive(token({ exp: 1_699_999_999 }), now), false);
  assert.equal(isSessionTokenActive('malformed', now), false);
});

test('rejects invalid expiration values', () => {
  assert.equal(isSessionTokenActive(token({ exp: 'later' }), 1000), false);
  assert.equal(isSessionTokenActive(token({ exp: 1 }), 1000), false);
});
