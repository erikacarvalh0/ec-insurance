import assert from 'node:assert/strict';
import test from 'node:test';

import { createProtectedLeadsHandler } from './leads-handler.mjs';

test('requires a verified session before returning leads', async () => {
  let queries = 0;
  const handler = createProtectedLeadsHandler({
    verifyToken: () => null,
    leadListRepository: { list: async () => { queries++; return []; } },
  });
  const response = await handler({ method: 'GET', headers: { authorization: 'Bearer invalid' } });
  assert.equal(response.status, 401);
  assert.equal(queries, 0);
});

test('uses verified actor, never request-provided identity', async () => {
  const actors = [];
  const handler = createProtectedLeadsHandler({
    verifyToken: (token) => token === 'valid' ? { userId: 'broker-1', role: 'broker' } : null,
    leadListRepository: { list: async (actor) => { actors.push(actor); return [{ id: 'lead-1' }]; } },
  });
  const response = await handler({
    method: 'GET',
    headers: { authorization: 'Bearer valid' },
    userId: 'attacker',
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.leads[0].id, 'lead-1');
  assert.equal(actors[0].userId, 'broker-1');
});

test('does not allow unsafe methods or disclose repository failures', async () => {
  const handler = createProtectedLeadsHandler({
    verifyToken: () => ({ userId: 'broker-1', role: 'broker' }),
    leadListRepository: { list: async () => { throw new Error('database password'); } },
  });
  assert.equal((await handler({ method: 'POST' })).status, 405);
  const response = await handler({ method: 'GET', headers: { authorization: 'Bearer valid' } });
  assert.equal(response.status, 500);
  assert.doesNotMatch(JSON.stringify(response), /database password/);
});
