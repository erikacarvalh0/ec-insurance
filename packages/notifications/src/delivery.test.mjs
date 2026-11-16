import assert from 'node:assert/strict';
import test from 'node:test';

import { createNotificationDispatcher } from './delivery.mjs';

test('delivers a notification through an injected adapter', async () => {
  const sent = [];
  const dispatcher = createNotificationDispatcher({
    send: async (message) => { sent.push(message); },
  });

  const result = await dispatcher.dispatch({
    idempotencyKey: 'notification-1',
    subject: 'Lead received',
    body: 'A new lead is ready.',
  });

  assert.equal(result.status, 'sent');
  assert.equal(sent.length, 1);
});

test('does not send a duplicate idempotency key', async () => {
  let count = 0;
  const dispatcher = createNotificationDispatcher({
    send: async () => { count += 1; },
  });
  const message = { idempotencyKey: 'notification-2', subject: 'Lead', body: 'New lead' };

  await dispatcher.dispatch(message);
  const duplicate = await dispatcher.dispatch(message);

  assert.equal(duplicate.status, 'duplicate');
  assert.equal(count, 1);
});

test('returns failed and allows a retry when the adapter throws', async () => {
  let attempts = 0;
  const dispatcher = createNotificationDispatcher({
    send: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('Network unavailable');
    },
  });
  const message = { idempotencyKey: 'notification-3', subject: 'Lead', body: 'New lead' };

  assert.equal((await dispatcher.dispatch(message)).status, 'failed');
  assert.equal((await dispatcher.dispatch(message)).status, 'sent');
});
