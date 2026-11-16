import assert from 'node:assert/strict';
import test from 'node:test';

import { assignLead } from './assignment.mjs';

test('rejects unauthenticated assignment', () => {
  assert.throws(() => assignLead({
    actor: null,
    lead: { id: 'lead-1', teamId: 'team-a' },
    broker: { id: 'broker-1', teamId: 'team-a', active: true },
  }), /not permitted/);
});

test('preserves original lead object', () => {
  const lead = { id: 'lead-1', teamId: 'team-a', ownerId: null };
  const result = assignLead({
    actor: { role: 'admin' },
    lead,
    broker: { id: 'broker-1', teamId: 'team-a', active: true },
  });

  assert.equal(lead.ownerId, null);
  assert.equal(result.ownerId, 'broker-1');
});
