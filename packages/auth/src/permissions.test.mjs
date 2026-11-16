import assert from 'node:assert/strict';
import test from 'node:test';

import { canAccessLead } from './permissions.mjs';

test('denies unauthenticated access', () => {
  assert.equal(canAccessLead(null, { teamId: 'team-1' }), false);
});

test('allows brokers to access only their own team leads', () => {
  const broker = { role: 'broker', teamId: 'team-1' };

  assert.equal(canAccessLead(broker, { teamId: 'team-1' }), true);
  assert.equal(canAccessLead(broker, { teamId: 'team-2' }), false);
});

test('rejects unknown roles', () => {
  assert.equal(canAccessLead({ role: 'unknown', teamId: 'team-1' }, { teamId: 'team-1' }), false);
});
