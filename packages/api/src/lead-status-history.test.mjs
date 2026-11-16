import assert from 'node:assert/strict';
import test from 'node:test';
import { createProtectedLeadStatusHistoryHandler } from './lead-status-history-handler.mjs';
import { createPrismaSecureRuntime } from './secure-runtime.mjs';

const actor = { role: 'broker', userId: 'b1' };
const request = { method: 'GET', url: '/api/leads/l1/status-history', headers: { authorization: 'Bearer signed' } };

test('history endpoint rejects unauthenticated requests before querying', async () => {
  for (const verifyToken of [() => null, () => { throw new Error('expired'); }]) {
    const handle = createProtectedLeadStatusHistoryHandler({ verifyToken, leadStatusHistoryRepository: { list: async () => assert.fail('must not query') } });
    assert.equal((await handle(request)).status, 401);
    assert.equal((await handle({ ...request, headers: {} })).status, 401);
  }
});

test('rejects invalid pagination and unsupported methods before querying', async () => {
  const handle = createProtectedLeadStatusHistoryHandler({ verifyToken: () => actor, leadStatusHistoryRepository: { list: async () => assert.fail('must not query') } });
  for (const query of ['limit=0', 'limit=101', 'limit=1.5', 'offset=-1', 'offset=100001', 'offset=bad']) {
    assert.equal((await handle({ ...request, url: `${request.url}?${query}` })).status, 400);
  }
  const response = await handle({ ...request, method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.Allow, 'GET');
});

test('maps empty pages, unavailable leads, forbidden actors and database failures', async () => {
  for (const [result, status] of [[[], 200], [null, 404], [new Error('Forbidden'), 403], [new Error('private database details'), 500]]) {
    const handle = createProtectedLeadStatusHistoryHandler({ verifyToken: () => actor, leadStatusHistoryRepository: { list: async () => {
      if (result instanceof Error) throw result;
      return result;
    } } });
    const response = await handle(request);
    assert.equal(response.status, status);
    assert.ok(!JSON.stringify(response).includes('private database details'));
  }
});

test('Prisma runtime exposes scoped persisted history through the HTTP adapter with ISO timestamps', async (t) => {
  let query;
  const runtime = createPrismaSecureRuntime({
    verifyToken: () => actor,
    prisma: {
      $disconnect: async () => {},
      lead: {
        create: async () => ({}), findMany: async () => [],
        findFirst: async (args) => {
          query = args;
          return { statusHistory: [{ id: 'h1', leadId: 'l1', actorId: 'b1', fromStatus: 'RECEIVED', toStatus: 'PROCESSING', createdAt: new Date('2026-01-01T10:00:00Z') }] };
        },
      },
    },
  });
  t.after(() => runtime.close());
  const headers = {};
  let status;
  const body = await new Promise((resolve) => {
    const response = {
      set statusCode(value) { status = value; },
      setHeader(name, value) { headers[name] = value; },
      end(value) { resolve(JSON.parse(value)); },
    };
    runtime.server.emit('request', { ...request, url: `${request.url}?limit=2&offset=4` }, response);
  });
  assert.equal(status, 200);
  assert.equal(headers['Cache-Control'], 'no-store');
  assert.deepEqual(body, { history: [{ id: 'h1', leadId: 'l1', actorId: 'b1', fromStatus: 'received', toStatus: 'processing', createdAt: '2026-01-01T10:00:00.000Z' }] });
  assert.deepEqual(query.where, { id: 'l1', ownerId: 'b1' });
  assert.equal(query.select.statusHistory.take, 2);
  assert.equal(query.select.statusHistory.skip, 4);
});
