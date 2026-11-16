import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadListRepository } from './list-repository.mjs';

test('paginates leads with stable ordering and bounded page size', async () => {
  let args;
  const repo = createPrismaLeadListRepository({ lead: { findMany: async (query) => { args = query; return []; } } });
  await repo.list({ role: 'broker', userId: 'broker-1' }, { limit: 20, offset: 40 });
  assert.equal(args.take, 20);
  assert.equal(args.skip, 40);
  assert.deepEqual(args.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);
  await assert.rejects(repo.list({ role: 'broker', userId: 'broker-1' }, { limit: 1000 }), /Invalid pagination/);
});
