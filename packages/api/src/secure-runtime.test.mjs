import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaSecureRuntime } from './secure-runtime.mjs';

test('combines Prisma lead persistence with authenticated listing', async (t) => {
  let disconnected = false;
  const prisma = {
    lead: {
      create: async ({ data }) => ({ id: 'lead-1', ...data }),
      findMany: async () => [{ id: 'lead-1', insuranceType: 'AUTO', status: 'RECEIVED', createdAt: new Date() }],
      findFirst: async ({ where, select }) => {
        assert.deepEqual(where, { id: 'lead-1', ownerId: 'broker-1' });
        assert.equal(select.contactEmail, undefined);
        return { id: 'lead-1', insuranceType: 'AUTO', status: 'RECEIVED', createdAt: new Date(), updatedAt: new Date() };
      },
    },
    $queryRawUnsafe: async () => [{ value: 1 }],
    $disconnect: async () => { disconnected = true; },
  };
  const runtime = createPrismaSecureRuntime({
    prisma,
    verifyToken: (token) => token === 'ok' ? { userId: 'broker-1', role: 'broker' } : null,
  });
  await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => runtime.close());
  const url = `http://127.0.0.1:${runtime.server.address().port}/api/leads`;
  assert.equal((await fetch(url)).status, 401);
  const response = await fetch(url, { headers: { authorization: 'Bearer ok' } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).leads[0].id, 'lead-1');
  const detailResponse = await fetch(`${url}/lead-1`, { headers: { authorization: 'Bearer ok' } });
  assert.equal(detailResponse.status, 200);
  const detail = (await detailResponse.json()).lead;
  assert.equal(detail.id, 'lead-1');
  assert.equal(detail.insuranceType, 'auto');
  assert.equal(detail.contactEmail, undefined);
  assert.equal(disconnected, false);
});
