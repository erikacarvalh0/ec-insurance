import assert from 'node:assert/strict';
import test from 'node:test';
import { loginBroker } from './client.mjs';

test('posts credentials and returns signed session', async () => {
  let captured;
  const result = await loginBroker({ email: 'broker@example.com', password: 'secret' }, {
    fetcher: async (url, options) => {
      captured = { url, options };
      return { ok: true, json: async () => ({ token: 'signed', actor: { role: 'broker' } }) };
    },
  });
  assert.equal(captured.url, '/api/login');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.cache, 'no-store');
  assert.equal(result.token, 'signed');
});

test('does not disclose backend error messages or accept missing tokens', async () => {
  await assert.rejects(loginBroker({ email: 'a', password: 'b' }, {
    fetcher: async () => ({ ok: false, json: async () => ({ error: 'internal secret' }) }),
  }), /Unable to sign in/);
  await assert.rejects(loginBroker({ email: 'a', password: 'b' }, {
    fetcher: async () => ({ ok: true, json: async () => ({}) }),
  }), /Unable to sign in/);
});
