import assert from 'node:assert/strict';
import test from 'node:test';

import { createHealthHandler } from './health.mjs';

test('reports healthy service when dependency probe succeeds', async () => {
  const handler = createHealthHandler({ checkDatabase: async () => true });
  assert.deepEqual(await handler({ method: 'GET' }), {
    status: 200,
    body: { status: 'ok' },
  });
});

test('reports unavailable when database probe fails', async () => {
  const handler = createHealthHandler({ checkDatabase: async () => { throw new Error('private database url'); } });
  const response = await handler({ method: 'GET' });
  assert.equal(response.status, 503);
  assert.doesNotMatch(JSON.stringify(response), /private database url/);
});

test('rejects unsupported methods', async () => {
  const handler = createHealthHandler({ checkDatabase: async () => true });
  const response = await handler({ method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.Allow, 'GET');
});
