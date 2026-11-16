import assert from 'node:assert/strict';
import test from 'node:test';

import { renderLeadTable } from './lead-table.mjs';

test('renders a semantic table with escaped content', () => {
  const html = renderLeadTable([
    { id: 'lead-1', insuranceType: 'Auto', status: '<script>alert(1)</script>' },
  ]);

  assert.match(html, /<table/);
  assert.match(html, /<th scope="col">/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('renders an accessible empty state', () => {
  const html = renderLeadTable([]);
  assert.match(html, /No leads found/);
});

test('does not expose customer PII in table rows', () => {
  const html = renderLeadTable([
    { id: 'lead-2', insuranceType: 'Travel', status: 'Received', email: 'secret@example.com' },
  ]);
  assert.doesNotMatch(html, /secret@example.com/);
});
