import assert from 'node:assert/strict';
import test from 'node:test';

import { summarizeLeads, toAccessibleLeadRows } from './dashboard.mjs';

const leads = [
  { id: 'lead-1', status: 'received', insuranceType: 'auto' },
  { id: 'lead-2', status: 'manual_review', insuranceType: 'travel' },
  { id: 'lead-3', status: 'quoted', insuranceType: 'life' },
];

test('summarizes lead statuses for dashboard cards', () => {
  assert.deepEqual(summarizeLeads(leads), {
    total: 3,
    received: 1,
    manualReview: 1,
    quoted: 1,
  });
});

test('maps leads to human-readable accessible table labels', () => {
  assert.deepEqual(toAccessibleLeadRows(leads)[1], {
    id: 'lead-2',
    insuranceType: 'Travel',
    status: 'Manual review',
  });
});

test('does not mutate the input list', () => {
  const before = structuredClone(leads);
  summarizeLeads(leads);
  toAccessibleLeadRows(leads);
  assert.deepEqual(leads, before);
});
