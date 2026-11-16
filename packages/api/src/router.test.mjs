import assert from 'node:assert/strict';
import test from 'node:test';

import { createApiRouter } from './router.mjs';

test('routes POST intake to the intake handler', async () => {
  const router = createApiRouter({
    intake: async (request) => ({ status: 201, body: { type: request.body.insuranceType } }),
    health: async () => ({ status: 200, body: { status: 'ok' } }),
  });

  assert.deepEqual(await router({ method: 'POST', url: '/api/intake', body: { insuranceType: 'auto' } }), {
    status: 201,
    body: { type: 'auto' },
  });
});

test('routes health checks without invoking intake', async () => {
  const router = createApiRouter({
    intake: async () => { throw new Error('Unexpected intake'); },
    health: async () => ({ status: 200, body: { status: 'ok' } }),
  });

  assert.equal((await router({ method: 'GET', url: '/health' })).status, 200);
});

test('returns 404 for unknown paths without leaking the URL', async () => {
  const router = createApiRouter({
    intake: async () => ({}),
    health: async () => ({}),
  });
  assert.deepEqual(await router({ method: 'GET', url: '/private?token=secret' }), {
    status: 404,
    body: { error: 'Not found' },
  });
});

test('matches path without query string', async () => {
  const router = createApiRouter({
    intake: async () => ({ status: 201, body: {} }),
    health: async () => ({ status: 200, body: {} }),
  });
  assert.equal((await router({ method: 'GET', url: '/health?verbose=1' })).status, 200);
});
