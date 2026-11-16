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
