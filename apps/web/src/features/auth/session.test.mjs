import assert from 'node:assert/strict';
import test from 'node:test';
import { isSessionTokenActive, watchSessionExpiration } from './session.mjs';

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

test('expires an active session at its deadline and supports cleanup', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  let expired = 0;
  const stop = watchSessionExpiration(token({ exp: 3 }), () => { expired += 1; });
  t.mock.timers.tick(1999);
  assert.equal(expired, 0);
  t.mock.timers.tick(1);
  assert.equal(expired, 1);
  stop();
  const cancel = watchSessionExpiration(token({ exp: 4 }), () => { expired += 1; });
  cancel();
  t.mock.timers.tick(1000);
  assert.equal(expired, 1);
});

test('long sessions do not overflow the browser timer limit', (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 });
  let expired = false;
  const stop = watchSessionExpiration(token({ exp: 4_102_444_800 }), () => { expired = true; });
  t.mock.timers.tick(2_147_483_647);
  assert.equal(expired, false);
  stop();
});

test('invalid and already expired sessions expire immediately', () => {
  for (const value of ['malformed', token({ exp: 1 })]) {
    let expired = false;
    watchSessionExpiration(value, () => { expired = true; })();
    assert.equal(expired, true);
  }
});
