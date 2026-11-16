import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuditEvent } from './audit.mjs';

test('records a safe lead status change with actor and timestamp', () => {
  const event = createAuditEvent({
    action: 'lead.status_changed',
    actorId: 'broker-1',
    resourceId: 'lead-1',
    metadata: { from: 'received', to: 'processing' },
  }, { now: () => new Date('2026-11-16T00:00:00.000Z') });

  assert.deepEqual(event, {
    action: 'lead.status_changed',
    actorId: 'broker-1',
    resourceId: 'lead-1',
    timestamp: '2026-11-16T00:00:00.000Z',
    metadata: { from: 'received', to: 'processing' },
  });
});

test('redacts customer data in audit metadata', () => {
  const event = createAuditEvent({
    action: 'lead.created',
    actorId: 'broker-1',
    resourceId: 'lead-1',
    metadata: { email: 'customer@example.com', reason: 'new lead' },
  });

  assert.equal(event.metadata.email, '[REDACTED]');
  assert.equal(event.metadata.reason, 'new lead');
});

test('rejects missing audit identity fields', () => {
  assert.throws(() => createAuditEvent({ action: 'lead.created' }), TypeError);
});
