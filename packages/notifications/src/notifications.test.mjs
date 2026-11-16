import assert from 'node:assert/strict';
import test from 'node:test';

import { createInMemoryNotifier } from './notifications.mjs';

test('records a new lead event without sending a real message', async () => {
  const notifier = createInMemoryNotifier();
  const result = await notifier.notify({
    idempotencyKey: 'event-1',
    type: 'lead.received',
    leadId: 'lead-1',
  });

  assert.equal(result.status, 'recorded');
  assert.equal(notifier.events().length, 1);
});

test('deduplicates retries with the same idempotency key', async () => {
  const notifier = createInMemoryNotifier();
  const event = {
    idempotencyKey: 'event-2',
    type: 'quote.manual_review',
    leadId: 'lead-2',
  };

  assert.deepEqual(await notifier.notify(event), await notifier.notify(event));
  assert.equal(notifier.events().length, 1);
});

test('rejects unsupported event types', async () => {
  const notifier = createInMemoryNotifier();

  await assert.rejects(
    notifier.notify({ idempotencyKey: 'event-3', type: 'other', leadId: 'lead-3' }),
    { name: 'TypeError' },
  );
});
