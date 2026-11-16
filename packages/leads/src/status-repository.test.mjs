import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadStatusRepository } from './status-repository.mjs';

function fixture({ failHistory = false, conflict = false } = {}) {
  const state = { status: 'RECEIVED', history: [] };
  const queries = [];
  const prisma = {
    async $transaction(run) {
      const pending = structuredClone(state);
      const result = await run({
        lead: {
          async findFirst({ where }) {
            queries.push(where);
            if ((where.ownerId && where.ownerId !== 'broker-1') || (where.teamId && where.teamId !== 'team-1') || where.id !== 'lead-1') return null;
            return { status: pending.status };
          },
          async updateMany({ where, data }) {
            assert.equal(where.status, pending.status);
            assert.deepEqual(where, { ...queries.at(-1), status: pending.status });
            if (conflict) return { count: 0 };
            pending.status = data.status;
            return { count: 1 };
          },
        },
        leadStatusHistory: {
          async create({ data }) {
            if (failHistory) throw new Error('Database unavailable');
            pending.history.push(data);
          },
        },
      });
      Object.assign(state, pending);
      return result;
    },
  };
  return { repo: createPrismaLeadStatusRepository(prisma), state, queries };
}

const broker = { role: 'broker', userId: 'broker-1' };

test('persists status and actor history in the same transaction for each authorized role', async () => {
  for (const actor of [broker, { role: 'manager', userId: 'manager-1', teamId: 'team-1' }, { role: 'admin', userId: 'admin-1' }]) {
    const { repo, state } = fixture();
    assert.deepEqual(await repo.updateStatus(actor, 'lead-1', 'contacted'), { id: 'lead-1', status: 'contacted' });
    assert.equal(state.status, 'CONTACTED');
    assert.equal(state.history.length, 1);
    assert.deepEqual({ ...state.history[0], createdAt: undefined }, {
      leadId: 'lead-1', actorId: actor.userId, fromStatus: 'RECEIVED', toStatus: 'CONTACTED', createdAt: undefined,
    });
    assert.ok(state.history[0].createdAt instanceof Date);
  }
});

test('out-of-scope and absent leads remain hidden and unchanged', async () => {
  for (const [actor, id] of [[{ ...broker, userId: 'other' }, 'lead-1'], [{ role: 'manager', userId: 'm', teamId: 'other' }, 'lead-1'], [broker, 'missing']]) {
    const { repo, state } = fixture();
    assert.equal(await repo.updateStatus(actor, id, 'contacted'), null);
    assert.deepEqual(state, { status: 'RECEIVED', history: [] });
  }
});

test('rejects unsupported actors before database access', async () => {
  for (const actor of [null, { role: 'admin' }, { role: 'manager', userId: 'm' }, { role: 'guest', userId: 'g' }]) {
    const { repo, queries } = fixture();
    await assert.rejects(repo.updateStatus(actor, 'lead-1', 'contacted'), /Forbidden/);
    assert.deepEqual(queries, []);
  }
});

test('rejects invalid transitions, including no-op updates, without writing history', async () => {
  for (const status of ['received', 'completed', 'unknown']) {
    const { repo, state } = fixture();
    await assert.rejects(repo.updateStatus(broker, 'lead-1', status), /Invalid status transition/);
    assert.deepEqual(state, { status: 'RECEIVED', history: [] });
  }
});

test('history failure rolls back the status change; concurrent changes do not produce history', async () => {
  for (const options of [{ failHistory: true }, { conflict: true }]) {
    const { repo, state } = fixture(options);
    await assert.rejects(repo.updateStatus(broker, 'lead-1', 'contacted'), options.conflict ? /concurrently/ : /Database unavailable/);
    assert.deepEqual(state, { status: 'RECEIVED', history: [] });
  }
});
