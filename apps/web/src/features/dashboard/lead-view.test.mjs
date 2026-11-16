import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDashboardLeadView } from './lead-view.mjs';

const leads = [
  { id: 'a', teamId: 'team-1', ownerId: 'broker-1', insuranceType: 'auto', status: 'received' },
  { id: 'b', teamId: 'team-1', ownerId: 'broker-2', insuranceType: 'travel', status: 'quoted' },
  { id: 'c', teamId: 'team-2', ownerId: 'broker-3', insuranceType: 'life', status: 'received' },
];

test('broker dashboard includes only assigned leads', () => {
  const view = buildDashboardLeadView(leads, {
    role: 'broker',
    id: 'broker-1',
    teamId: 'team-1',
  });

  assert.equal(view.summary.total, 1);
  assert.deepEqual(view.rows.map((row) => row.id), ['a']);
});

test('manager dashboard counts only its own team', () => {
  const view = buildDashboardLeadView(leads, { role: 'manager', teamId: 'team-1' });
  assert.equal(view.summary.total, 2);
});

test('anonymous dashboard reveals no leads', () => {
  const view = buildDashboardLeadView(leads, null);
  assert.equal(view.summary.total, 0);
  assert.deepEqual(view.rows, []);
});
