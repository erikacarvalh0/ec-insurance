import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';
import { createPrismaSecureRuntime } from './secure-runtime.mjs';

test('PATCH lead status is wired through the secure Prisma runtime', async (t) => {
  const history = [];
  let status = 'RECEIVED';
  const runtime = createPrismaSecureRuntime({
    verifyToken: (token) => token === 'ok' ? { role: 'broker', userId: 'broker-1' } : null,
    prisma: {
      lead: { create() {}, findMany() {}, findFirst() {} },
      async $disconnect() {},
      async $transaction(run) {
        let pendingStatus = status;
        const pendingHistory = [];
        const result = await run({
          lead: {
            async findFirst({ where }) {
              assert.deepEqual(where, { id: 'lead-1', ownerId: 'broker-1' });
              return { status: pendingStatus };
            },
            async updateMany({ data }) { pendingStatus = data.status; return { count: 1 }; },
          },
          leadStatusHistory: { async create({ data }) { pendingHistory.push(data); } },
        });
        status = pendingStatus;
        history.push(...pendingHistory);
        return result;
      },
    },
  });
  t.after(() => runtime.close());
  const url = '/api/leads/lead-1/status';
  function fetch(url, options = {}) {
    return new Promise((resolve) => {
      const request = Readable.from(options.body ? [Buffer.from(options.body)] : []);
      Object.assign(request, { url, method: options.method ?? 'GET', headers: options.headers ?? {} });
      const headers = new Map();
      const response = {
        setHeader(name, value) { headers.set(name.toLowerCase(), value); },
        end(body) { resolve({ status: this.statusCode, headers, json: async () => JSON.parse(body) }); },
      };
      runtime.server.emit('request', request, response);
    });
  }
  const headers = { authorization: 'Bearer ok', 'content-type': 'application/json' };
  assert.equal((await fetch(url, { method: 'PATCH' })).status, 401);
  assert.equal((await fetch(url, { headers })).status, 405);
  assert.equal((await fetch(url, { method: 'PATCH', headers: { authorization: 'Bearer ok' }, body: '{}' })).status, 415);
  for (const body of ['{', '[]', '{}', '{"status":42}', '{"status":"contacted","actorId":"spoofed"}']) {
    assert.equal((await fetch(url, { method: 'PATCH', headers, body })).status, 400);
  }
  assert.equal((await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ status: 'x'.repeat(4096) }) })).status, 413);
  const response = await fetch(url, { method: 'PATCH', headers, body: '{"status":"contacted"}' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { lead: { id: 'lead-1', status: 'contacted' } });
  assert.equal(status, 'CONTACTED');
  assert.equal(history.length, 1);
  assert.equal(history[0].actorId, 'broker-1');
  const conflict = await fetch(url, { method: 'PATCH', headers, body: '{"status":"received"}' });
  assert.equal(conflict.status, 409);
  assert.equal(history.length, 1);
});
