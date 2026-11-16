import assert from 'node:assert/strict';
import test from 'node:test';
import { filterBrokerLeads } from './lead-filter.mjs';

test('filters leads by status without mutating the source', () => {
  const leads = [{id:'1',status:'received'},{id:'2',status:'contacted'}];
  assert.deepEqual(filterBrokerLeads(leads, 'contacted'), [leads[1]]);
  assert.equal(leads.length, 2);
  assert.deepEqual(filterBrokerLeads(leads, 'all'), leads);
});

test('handles missing status and validates input', () => {
  assert.deepEqual(filterBrokerLeads([{id:'1'}], 'received'), []);
  assert.throws(() => filterBrokerLeads(null, 'all'), /leads/i);
});
