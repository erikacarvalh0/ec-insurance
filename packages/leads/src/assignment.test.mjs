import assert from 'node:assert/strict';
import test from 'node:test';

import { assignLead } from './assignment.mjs';

test('allows managers to assign leads within their team', () => {
  const result = assignLead({
    actor: { role: 'manager', teamId: 'team-a' },
    lead: { id: 'lead-1', teamId: 'team-a', ownerId: null },
    broker: { id: 'broker-1', teamId: 'team-a', active: true },
  });

  assert.equal(result.ownerId, 'broker-1');
});

test('rejects assignments across teams', () => {
  assert.throws(() => assignLead({
    actor: { role: 'manager', teamId: 'team-a' },
    lead: { id: 'lead-1', teamId: 'team-a' },
    broker: { id: 'broker-2', teamId: 'team-b', active: true },
  }), /not permitted/);
});

test('rejects inactive brokers', () => {
  assert.throws(() => assignLead({
    actor: { role: 'admin' },
    lead: { id: 'lead-1', teamId: 'team-a' },
    broker: { id: 'broker-1', teamId: 'team-a', active: false },
  }), /inactive/);
});
