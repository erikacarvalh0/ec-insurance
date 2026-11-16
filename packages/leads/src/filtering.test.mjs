import assert from 'node:assert/strict';
import test from 'node:test';

import { filterVisibleLeads } from './filtering.mjs';

const leads = [
  { id: 'lead-1', teamId: 'a', ownerId: 'broker-1', status: 'received' },
  { id: 'lead-2', teamId: 'a', ownerId: 'broker-2', status: 'quoted' },
  { id: 'lead-3', teamId: 'b', ownerId: 'broker-3', status: 'received' },
];

test('brokers see only their assigned leads', () => {
  const visible = filterVisibleLeads(leads, {
    role: 'broker',
    id: 'broker-1',
    teamId: 'a',
  });

  assert.deepEqual(visible.map((lead) => lead.id), ['lead-1']);
});

test('managers see their team leads', () => {
  const visible = filterVisibleLeads(leads, {
    role: 'manager',
    teamId: 'a',
  });

  assert.deepEqual(visible.map((lead) => lead.id), ['lead-1', 'lead-2']);
});

test('unauthenticated users see no leads', () => {
  assert.deepEqual(filterVisibleLeads(leads, null), []);
});

test('status filters apply after authorization', () => {
  const visible = filterVisibleLeads(leads, { role: 'admin' }, { status: 'received' });
  assert.deepEqual(visible.map((lead) => lead.id), ['lead-1', 'lead-3']);
});
