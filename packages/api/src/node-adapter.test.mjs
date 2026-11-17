import assert from 'node:assert/strict';
import test from 'node:test';

import { createNodeHttpAdapter } from './node-adapter.mjs';

function fakeResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: '',
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.payload = value; },
  };
}

test('responds with JSON and status returned by handler', async () => {
  const adapter = createNodeHttpAdapter(async () => ({
    status: 201,
    body: { leadId: 'lead-1' },
  }));
  const response = fakeResponse();

  await adapter({ method: 'POST', body: { insuranceType: 'auto' } }, response);
  assert.equal(response.statusCode, 201);
  assert.equal(response.headers['Content-Type'], 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(response.payload), { leadId: 'lead-1' });
});

test('forwards allowed method response header', async () => {
  const adapter = createNodeHttpAdapter(async () => ({
    status: 405,
    headers: { Allow: 'POST' },
    body: { error: 'Method not allowed' },
  }));
  const response = fakeResponse();

  await adapter({ method: 'GET' }, response);
  assert.equal(response.headers.Allow, 'POST');
});

test('does not leak errors from the handler', async () => {
  const adapter = createNodeHttpAdapter(async () => { throw new Error('private secret'); });
  const response = fakeResponse();

  await adapter({ method: 'POST' }, response);
  assert.equal(response.statusCode, 500);
  assert.doesNotMatch(response.payload, /private secret/);
});

test('correlates requests and emits structured metadata without PII', async () => {
  const entries = [];
  const adapter = createNodeHttpAdapter(async () => ({
    status: 200,
    headers: { 'X-Request-Id': 'untrusted-override' },
    body: { ok: true },
  }), { logger: { info: (entry) => entries.push(JSON.parse(entry)) } });
  const response = fakeResponse();
  await adapter({
    method: 'GET',
    url: '/api/leads?email=private@example.com',
    headers: { 'x-request-id': 'safe-id_123', authorization: 'Bearer secret' },
  }, response);

  assert.equal(response.headers['X-Request-Id'], 'safe-id_123');
  assert.equal(entries.length, 1);
  assert.deepEqual(Object.keys(entries[0]), ['event', 'requestId', 'method', 'status', 'durationMs']);
  assert.equal(entries[0].requestId, 'safe-id_123');
  assert.equal(entries[0].status, 200);
  assert.ok(entries[0].durationMs >= 0);
  assert.doesNotMatch(JSON.stringify(entries), /private@example.com|Bearer|secret/);
});

test('rejects unsafe incoming request IDs and logs failures without secrets', async () => {
  const entries = [];
  const adapter = createNodeHttpAdapter(async () => { throw new Error('secret password'); }, {
    logger: { info: (entry) => entries.push(JSON.parse(entry)) },
  });
  const response = fakeResponse();
  await adapter({ method: 'POST', headers: { 'x-request-id': 'bad\nheader' } }, response);
  assert.match(response.headers['X-Request-Id'], /^[0-9a-f-]{36}$/);
  assert.equal(entries[0].status, 500);
  assert.equal(entries[0].requestId, response.headers['X-Request-Id']);
  assert.doesNotMatch(JSON.stringify(entries), /secret password|bad\\nheader/);
});

test('preserves upstream request correlation without logging twice', async () => {
  const entries = [];
  const response = fakeResponse();
  response.getHeader = (name) => response.headers[name];
  response.setHeader('X-Request-ID', 'upstream-id');
  const adapter = createNodeHttpAdapter(async () => ({ status: 200 }), {
    logger: { info: (entry) => entries.push(entry) },
  });
  await adapter({ method: 'GET', headers: { 'x-request-id': 'client-id' } }, response);
  assert.equal(response.headers['X-Request-ID'], 'upstream-id');
  assert.equal(response.headers['X-Request-Id'], undefined);
  assert.equal(entries.length, 0);
});
