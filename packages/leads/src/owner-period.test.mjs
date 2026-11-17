import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrismaLeadListRepository } from './list-repository.mjs';
test('owner filter intersects broker scope and UTC period',async()=>{
 let query;
 const repo=createPrismaLeadListRepository({lead:{findMany:async q=>{query=q;return [];}}});
 await repo.list({role:'broker',userId:'a'},{ownerId:'b',from:'2026-01-01',to:'2026-02-01'});
 assert.equal(query.where.ownerId,'a');
 assert.deepEqual(query.where.AND,[{ownerId:'b'}]);
 assert.deepEqual(query.where.createdAt,{gte:new Date('2026-01-01'),lt:new Date('2026-02-01')});
 await assert.rejects(repo.list({role:'broker',userId:'a'},{from:'2026-02-30'}));
});
