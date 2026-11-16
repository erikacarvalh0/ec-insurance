import assert from 'node:assert/strict';
import test from 'node:test';

import { renderNotification } from './templates.mjs';

test('renders a lead received notification without contact PII', () => {
  const result = renderNotification({
    type: 'lead.received',
    leadId: 'lead-1',
    contact: { email: 'customer@example.com' },
  });

  assert.equal(result.subject, 'New insurance lead');
  assert.match(result.body, /lead-1/);
  assert.doesNotMatch(result.body, /customer@example.com/);
});

test('renders manual review notification', () => {
  const result = renderNotification({
    type: 'quote.manual_review',
    leadId: 'lead-2',
  });

  assert.match(result.body, /manual review/i);
});

test('rejects unsupported notification types', () => {
  assert.throws(() => renderNotification({ type: 'unknown', leadId: 'lead-3' }), {
    name: 'TypeError',
  });
});
