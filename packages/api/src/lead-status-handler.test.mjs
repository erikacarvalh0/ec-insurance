import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';
import { createProtectedLeadStatusHandler } from './lead-status-handler.mjs';

test('maps hidden leads, forbidden actors, concurrent writes and storage failures', async () => {
  for (const [result, expected, message] of [
    [null, 404, 'Not found'],
    [new Error('Forbidden'), 403, 'Forbidden'],
    [new Error('Lead changed concurrently'), 409, 'Lead changed concurrently'],
    [new Error('private database details'), 500, 'Internal server error'],
  ]) {
    const handler = createProtectedLeadStatusHandler({
      verifyToken: () => ({ userId: 'broker-1', role: 'broker' }),
      leadStatusRepository: { async updateStatus() { if (result instanceof Error) throw result; return result; } },
    });
    const request = Readable.from([Buffer.from('{"status":"contacted"}')]);
    Object.assign(request, { method: 'PATCH', url: '/api/leads/lead-1/status', headers: { authorization: 'Bearer ok', 'content-type': 'application/json' } });
    assert.deepEqual(await handler(request), { status: expected, body: { error: message } });
  }
});

test('invalid tokens cannot read the request body or call persistence', async () => {
  const handler = createProtectedLeadStatusHandler({
    verifyToken() { throw new Error('Expired'); },
    leadStatusRepository: { updateStatus() { assert.fail('must not persist'); } },
  });
  assert.equal((await handler({ method: 'PATCH', headers: { authorization: 'Bearer expired' } })).status, 401);
});
