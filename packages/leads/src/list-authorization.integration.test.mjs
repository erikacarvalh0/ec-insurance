import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadListRepository } from './list-repository.mjs';

test('broker cannot request another broker leads via pagination', async () => {
  let query;
  const repo = createPrismaLeadListRepository({ lead: { findMany: async (args) => { query = args; return []; } } });
  await repo.list({ role:'broker', userId:'broker-1', teamId:'team-1' }, { limit: 10, offset: 20 });
  assert.deepEqual(query.where, { ownerId:'broker-1' });
  assert.equal(query.skip, 20);
  assert.equal(query.take, 10);
});

test('manager and admin scopes remain distinct', async () => {
  const queries=[];
  const repo=createPrismaLeadListRepository({lead:{findMany:async(args)=>{queries.push(args.where);return [];}}});
  await repo.list({role:'manager',teamId:'team-1'});
  await repo.list({role:'admin',userId:'admin-1'});
  assert.deepEqual(queries,[{teamId:'team-1'},{}]);
});
