import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchBrokerLeads } from './client.mjs';

test('requests authenticated lead list without caching', async () => {
  let request;
  const leads = await fetchBrokerLeads({
    token: 'signed-token',
    fetcher: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ leads: [{ id: 'lead-1' }] }) };
    },
  });
  assert.equal(request.url, '/api/leads');
  assert.equal(request.options.headers.Authorization, 'Bearer signed-token');
  assert.equal(request.options.cache, 'no-store');
  assert.deepEqual(leads, [{ id: 'lead-1' }]);
});

test('rejects missing sessions without network request', async () => {
  let called = false;
  await assert.rejects(fetchBrokerLeads({
    token: '',
    fetcher: async () => { called = true; },
  }), /session/i);
  assert.equal(called, false);
});

test('does not expose backend response body on failed requests', async () => {
  await assert.rejects(fetchBrokerLeads({
    token: 'valid',
    fetcher: async () => ({ ok: false, status: 500, json: async () => ({ error: 'db secret' }) }),
  }), /Unable to load leads/);
});

test('reports an invalid server session without reading the response body', async () => {
  await assert.rejects(fetchBrokerLeads({
    token: 'revoked-token',
    fetcher: async () => ({ ok: false, status: 401 }),
  }), (error) => error.status === 401 && error.message === 'Unable to load leads');
});

test('preserves other failures without identifying them as expired sessions', async () => {
  for (const status of [403, 500]) {
    await assert.rejects(fetchBrokerLeads({
      token: 'valid', fetcher: async () => ({ ok: false, status }),
    }), (error) => error.status === status);
  }
});
