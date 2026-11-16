import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadDetailRepository } from './detail-repository.mjs';

test('broker only reads own lead without contact PII', async () => {
  let args;
  const repo = createPrismaLeadDetailRepository({lead:{findFirst:async(q)=>{args=q;return{id:'lead-1',insuranceType:'AUTO',status:'RECEIVED',contactEmail:'private@example.com'};}}});
  const result=await repo.findById({role:'broker',userId:'b1'},'lead-1');
  assert.deepEqual(args.where,{id:'lead-1',ownerId:'b1'});
  assert.equal(result.contactEmail,undefined);
  assert.equal(result.insuranceType,'auto');
});

test('rejects unauthorized actors before querying',async()=>{
  let queried=false;
  const repo=createPrismaLeadDetailRepository({lead:{findFirst:async()=>{queried=true;return null;}}});
  await assert.rejects(repo.findById({role:'broker'},'lead-1'),/Forbidden/);
  assert.equal(queried,false);
});
