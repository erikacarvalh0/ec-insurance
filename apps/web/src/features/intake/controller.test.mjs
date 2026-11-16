import assert from 'node:assert/strict';
import test from 'node:test';

import { createIntakeController } from './controller.mjs';

test('submits form values and exposes successful completion', async () => {
  const states = [];
  const controller = createIntakeController({
    submit: async (values, options) => ({ success: true, id: options.idempotencyKey, name: values.name }),
    createKey: () => 'request-1',
    onStateChange: (state) => states.push(state),
  });

  const result = await controller.submit({ name: 'Jane' });
  assert.equal(result.id, 'request-1');
  assert.deepEqual(states.map((state) => state.status), ['submitting', 'success']);
});

test('returns a safe failure state and allows retry with the same key', async () => {
  const keys = [];
  const controller = createIntakeController({
    submit: async (_values, options) => { keys.push(options.idempotencyKey); throw new Error('Network unavailable'); },
    createKey: () => 'request-2',
  });

  await assert.rejects(controller.submit({ name: 'Jane' }), /Network unavailable/);
  await assert.rejects(controller.submit({ name: 'Jane' }), /Network unavailable/);
  assert.deepEqual(keys, ['request-2', 'request-2']);
  assert.equal(controller.getState().status, 'error');
});
