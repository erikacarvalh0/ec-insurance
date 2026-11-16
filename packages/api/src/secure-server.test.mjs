import assert from 'node:assert/strict';
import test from 'node:test';
import { createSecureApiServer } from './secure-server.mjs';

test('serves authenticated lead listing and rejects anonymous access', async (t) => {
  const server = createSecureApiServer({
    leadRepository: { create: async () => ({ id: 'new-lead' }) },
    checkDatabase: async () => true,
    verifyToken: (token) => token === 'valid' ? { userId: 'broker-1', role: 'broker' } : null,
    leadListRepository: { list: async (actor) => [{ id: actor.userId, status: 'received' }] },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/leads`;
  assert.equal((await fetch(url)).status, 401);
  const response = await fetch(url, { headers: { authorization: 'Bearer valid' } });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).leads, [{ id: 'broker-1', status: 'received' }]);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('does not allow unsafe methods on lead listing', async (t) => {
  const server = createSecureApiServer({
    leadRepository: { create: async () => ({ id: 'new-lead' }) },
    checkDatabase: async () => true,
    verifyToken: () => null,
    leadListRepository: { list: async () => [] },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/leads`, { method: 'POST' });
  assert.equal(response.status, 405);
});
