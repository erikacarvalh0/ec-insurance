import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadListRepository } from './list-repository.mjs';
import { createProtectedLeadsHandler } from '../../api/src/leads-handler.mjs';

test('filters preserve broker ownership and use exact enum values',async()=>{
 let query;const repo=createPrismaLeadListRepository({lead:{findMany:async(input)=>{query=input;return[];}}});
 await repo.list({role:'broker',userId:'broker-1'},{status:'received',insuranceType:'auto'});
 assert.deepEqual(query.where,{ownerId:'broker-1',status:'RECEIVED',insuranceType:'AUTO'});
});
test('rejects unsupported filter values without querying Prisma',async()=>{
 let called=false;const repo=createPrismaLeadListRepository({lead:{findMany:async()=>{called=true;return[];}}});
 await assert.rejects(repo.list({role:'admin',userId:'admin-1'},{status:'not-a-status'}),/Invalid filters/);
 assert.equal(called,false);
});
test('HTTP listing forwards validated filters and rejects invalid input',async()=>{
 let options;const handler=createProtectedLeadsHandler({verifyToken:()=>({role:'broker',userId:'broker-1'}),leadListRepository:{list:async(_actor,input)=>{options=input;return[];}}});
 const request=(url)=>({method:'GET',url,headers:{authorization:'Bearer token'}});
 assert.equal((await handler(request('/api/leads?status=received&insuranceType=auto'))).status,200);
 assert.equal(options.status,'received');assert.equal(options.insuranceType,'auto');
 assert.equal((await handler(request('/api/leads?status=wrong'))).status,400);
});
