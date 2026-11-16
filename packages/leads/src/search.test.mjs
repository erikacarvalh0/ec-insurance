import assert from 'node:assert/strict';
import test from 'node:test';

import { searchLeads } from './search.mjs';

const leads = [
  { id: 'lead-1', insuranceType: 'auto', status: 'received', contact: { name: 'Maria Silva' } },
  { id: 'lead-2', insuranceType: 'travel', status: 'quoted', contact: { name: 'João Souza' } },
  { id: 'lead-3', insuranceType: 'auto', status: 'quoted', contact: { name: 'Ana Maria' } },
];

test('searches names case-insensitively', () => {
  assert.deepEqual(searchLeads(leads, { query: 'MARIA' }).map((lead) => lead.id), [
    'lead-1',
    'lead-3',
  ]);
});

test('combines type and status filters', () => {
  assert.deepEqual(searchLeads(leads, { insuranceType: 'auto', status: 'quoted' }).map((lead) => lead.id), [
    'lead-3',
  ]);
});

test('does not mutate the input array', () => {
  const result = searchLeads(leads);
  assert.notEqual(result, leads);
  assert.equal(leads.length, 3);
});
