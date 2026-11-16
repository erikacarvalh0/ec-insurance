import assert from 'node:assert/strict';
import test from 'node:test';

import { renderDashboardPage } from './page.mjs';

test('renders semantic dashboard page with totals and lead table', () => {
  const html = renderDashboardPage({
    summary: { total: 2, received: 1, quoted: 1, manualReview: 0 },
    rows: [{ id: 'lead-1', insuranceType: 'Auto', status: 'Received' }],
  });

  assert.match(html, /<main/);
  assert.match(html, /<h1>Insurance dashboard<\/h1>/);
  assert.match(html, /Total leads: 2/);
  assert.match(html, /<table/);
});

test('renders empty state when there are no leads', () => {
  const html = renderDashboardPage({
    summary: { total: 0, received: 0, quoted: 0, manualReview: 0 },
    rows: [],
  });

  assert.match(html, /No leads found/);
});

test('escapes untrusted summary values', () => {
  const html = renderDashboardPage({
    summary: { total: '<script>bad()</script>', received: 0, quoted: 0, manualReview: 0 },
    rows: [],
  });

  assert.doesNotMatch(html, /<script>/);
});
