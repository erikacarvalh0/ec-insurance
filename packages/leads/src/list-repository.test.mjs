import assert from 'node:assert/strict';
import test from 'node:test';

import { createPrismaLeadListRepository } from './list-repository.mjs';

const lead = {
  id: 'lead-1', insuranceType: 'AUTO', status: 'RECEIVED',
  contactName: 'Jane', contactEmail: 'jane@example.com', contactPhone: '11987654321',
};

test('broker receives only own leads and no contact PII', async () => {
  const calls = [];
  const repository = createPrismaLeadListRepository({
    lead: { findMany: async (args) => { calls.push(args); return [lead]; } },
  });
  const rows = await repository.list({ role: 'broker', userId: 'broker-1' });
  assert.equal(calls[0].where.ownerId, 'broker-1');
  assert.equal(rows[0].id, 'lead-1');
  assert.equal(rows[0].insuranceType, 'auto');
  assert.equal(rows[0].contactEmail, undefined);
  assert.equal(rows[0].contactPhone, undefined);
});

test('manager is restricted to its own team', async () => {
  const calls = [];
  const repository = createPrismaLeadListRepository({
    lead: { findMany: async (args) => { calls.push(args); return []; } },
  });
  await repository.list({ role: 'manager', teamId: 'team-1' });
  assert.equal(calls[0].where.teamId, 'team-1');
});

test('anonymous and missing ownership scopes are rejected before querying', async () => {
  let queried = false;
  const repository = createPrismaLeadListRepository({
    lead: { findMany: async () => { queried = true; return []; } },
  });
  await assert.rejects(repository.list({ role: 'broker' }), /Forbidden/);
  await assert.rejects(repository.list(null), /Forbidden/);
  assert.equal(queried, false);
});
