import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';
import { createHttpLoginHandler } from './http-login.mjs';

function request(body, overrides = {}) {
  const stream = Readable.from([JSON.stringify(body)]);
  return Object.assign(stream, {
    method: 'POST', headers: { 'content-type': 'application/json' },
  }, overrides);
}

test('parses a JSON login request and passes credentials to domain handler', async () => {
  const handle = createHttpLoginHandler({ login: async (req) => ({
    status: 200, body: { email: req.body.email },
  }) });
  const result = await handle(request({ email: 'broker@example.com', password: 'secret' }));
  assert.equal(result.status, 200);
  assert.equal(result.body.email, 'broker@example.com');
});

test('rejects malformed JSON, unsupported media types and oversized bodies', async () => {
  const handle = createHttpLoginHandler({ login: async () => ({ status: 200 }) });
  assert.equal((await handle(request({}, { headers: { 'content-type': 'text/plain' } }))).status, 415);
  const broken = Object.assign(Readable.from(['{broken']), { method: 'POST', headers: { 'content-type': 'application/json' } });
  assert.equal((await handle(broken)).status, 400);
  assert.equal((await handle(request({ value: 'x'.repeat(5000) }))).status, 413);
});
