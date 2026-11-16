import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadStatusHistoryRepository } from './status-history-repository.mjs';

for (const [actor, scope] of [
  [{ role: 'broker', userId: 'b1' }, { ownerId: 'b1' }],
  [{ role: 'manager', teamId: 't1' }, { teamId: 't1' }],
  [{ role: 'admin', userId: 'a1' }, {}],
]) {
  test(`reads persisted history within ${actor.role} scope with bounded stable pagination`, async () => {
    let query;
    const entry = { id: 'h1', leadId: 'l1', actorId: 'b1', fromStatus: 'RECEIVED', toStatus: 'PROCESSING', createdAt: new Date('2026-01-01T10:00:00Z') };
    const repo = createPrismaLeadStatusHistoryRepository({ lead: { findFirst: async (args) => {
      query = args;
      return { statusHistory: [entry] };
    } } });
    assert.deepEqual(await repo.list(actor, 'l1', { limit: 2, offset: 4 }), [
      { ...entry, fromStatus: 'received', toStatus: 'processing' },
    ]);
    assert.deepEqual(query, {
      where: { id: 'l1', ...scope },
      select: { statusHistory: {
        select: { id: true, leadId: true, actorId: true, fromStatus: true, toStatus: true, createdAt: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 2, skip: 4,
      } },
    });
  });
}

test('rejects invalid actors and pagination before querying', async () => {
  const repo = createPrismaLeadStatusHistoryRepository({ lead: { findFirst: async () => assert.fail('must not query') } });
  for (const actor of [null, { role: 'broker' }, { role: 'manager' }, { role: 'admin' }, { role: 'unknown', userId: 'x' }]) {
    await assert.rejects(repo.list(actor, 'l1'), /Forbidden/);
  }
  for (const options of [{ limit: 0 }, { limit: 101 }, { offset: -1 }, { offset: 100001 }]) {
    await assert.rejects(repo.list({ role: 'admin', userId: 'a1' }, 'l1', options), /Invalid pagination/);
  }
});

test('distinguishes missing or inaccessible leads from an empty history page', async () => {
  for (const [record, expected] of [[null, null], [{ statusHistory: [] }, []]]) {
    const repo = createPrismaLeadStatusHistoryRepository({ lead: { findFirst: async () => record } });
    assert.deepEqual(await repo.list({ role: 'broker', userId: 'b1' }, 'l1'), expected);
  }
});
