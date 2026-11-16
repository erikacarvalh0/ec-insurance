import assert from 'node:assert/strict';
import test from 'node:test';

import { paginateLeads } from './pagination.mjs';

const leads = Array.from({ length: 5 }, (_, index) => ({ id: `lead-${index + 1}` }));

test('returns deterministic pages with metadata', () => {
  assert.deepEqual(paginateLeads(leads, { page: 2, pageSize: 2 }), {
    items: [{ id: 'lead-3' }, { id: 'lead-4' }],
    page: 2,
    pageSize: 2,
    total: 5,
    totalPages: 3,
  });
});

test('defaults to first page and safe page size', () => {
  const result = paginateLeads(leads);
  assert.equal(result.page, 1);
  assert.equal(result.pageSize, 20);
});

test('rejects invalid page arguments', () => {
  assert.throws(() => paginateLeads(leads, { page: 0 }), RangeError);
  assert.throws(() => paginateLeads(leads, { pageSize: 101 }), RangeError);
});

test('does not mutate source list', () => {
  paginateLeads(leads, { page: 1, pageSize: 2 });
  assert.equal(leads.length, 5);
});
