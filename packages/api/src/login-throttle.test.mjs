import assert from 'node:assert/strict';
import test from 'node:test';
import { createHttpLoginHandler } from './http-login.mjs';

test('limits attempts per remote address before parsing request body', async () => {
  const seen = [];
  const handle = createHttpLoginHandler({
    login: async () => ({ status: 401, body: { error: 'Invalid credentials' } }),
    limiter: { allow: (key) => { seen.push(key); return seen.length === 1; } },
  });
  const request = () => ({ method: 'POST', socket: { remoteAddress: '192.0.2.5' },
    headers: { 'content-type': 'application/json' }, async *[Symbol.asyncIterator]() {
      yield Buffer.from('{"email":"broker@example.com","password":"bad"}');
    } });
  assert.equal((await handle(request())).status, 401);
  const blocked = await handle(request());
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers['Retry-After'], '60');
  assert.deepEqual(seen, ['192.0.2.5', '192.0.2.5']);
});

test('rejects requests without a trusted remote address when throttling is enabled', async () => {
  const handle = createHttpLoginHandler({ login: async () => ({ status: 200 }), limiter: { allow: () => false } });
  assert.equal((await handle({ method: 'POST', headers: { 'content-type': 'application/json' } })).status, 429);
});
