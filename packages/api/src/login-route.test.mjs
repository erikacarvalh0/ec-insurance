import assert from 'node:assert/strict';
import test from 'node:test';
import { createSecureApiServer } from './secure-server.mjs';

test('secure server routes login to credential handler without leaking credentials', async (t) => {
  const server = createSecureApiServer({
    leadRepository: { create: async () => ({ id: 'lead' }) },
    checkDatabase: async () => true,
    verifyToken: () => null,
    leadListRepository: { list: async () => [] },
    login: async ({ body }) => body.email === 'broker@example.com'
      ? { status: 200, body: { token: 'signed' }, headers: { 'Cache-Control': 'no-store' } }
      : { status: 401, body: { error: 'Invalid credentials' } },
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/login`;
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'broker@example.com', password: 'secret' }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).token, 'signed');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await fetch(url)).status, 405);
});
