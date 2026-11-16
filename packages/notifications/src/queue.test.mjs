import assert from 'node:assert/strict';
import test from 'node:test';

import { createNotificationQueue } from './queue.mjs';

test('enqueues messages with unique idempotency keys', () => {
  const queue = createNotificationQueue();
  const first = queue.enqueue({ idempotencyKey: 'key-1', type: 'lead.received' });
  const duplicate = queue.enqueue({ idempotencyKey: 'key-1', type: 'lead.received' });

  assert.equal(first.status, 'queued');
  assert.equal(duplicate.status, 'duplicate');
  assert.equal(queue.pending().length, 1);
});

test('acknowledges queued messages', () => {
  const queue = createNotificationQueue();
  queue.enqueue({ idempotencyKey: 'key-2', type: 'quote.completed' });
  assert.equal(queue.acknowledge('key-2'), true);
  assert.deepEqual(queue.pending(), []);
});

test('rejects missing idempotency keys', () => {
  const queue = createNotificationQueue();
  assert.throws(() => queue.enqueue({ type: 'lead.received' }), TypeError);
});
