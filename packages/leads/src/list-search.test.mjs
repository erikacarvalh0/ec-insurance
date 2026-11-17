import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadListRepository } from './list-repository.mjs';
import { createProtectedLeadsHandler } from '../../api/src/leads-handler.mjs';

test('searches by lead id prefix within broker scope and existing filters',async()=>{
 let args;const repo=createPrismaLeadListRepository({lead:{findMany:async(value)=>{args=value;return[];}}});
 await repo.list({role:'broker',userId:'broker-1'},{search:'lead-123',status:'received'});
 assert.deepEqual(args.where,{ownerId:'broker-1',status:'RECEIVED',id:{startsWith:'lead-123'}});
 assert.equal(args.select.contactEmail,undefined);
});
test('rejects invalid search before database access',async()=>{
 let queried=false;const repo=createPrismaLeadListRepository({lead:{findMany:async()=>{queried=true;return[];}}});
 await assert.rejects(repo.list({role:'admin',userId:'admin-1'},{search:'%'}),/Invalid search/);
 assert.equal(queried,false);
});
test('HTTP handler accepts safe id prefix and rejects wildcard or repeated search',async()=>{
 let options;const handler=createProtectedLeadsHandler({verifyToken:()=>({role:'broker',userId:'b'}),leadListRepository:{list:async(_actor,value)=>{options=value;return[];}}});
 const request=url=>({method:'GET',url,headers:{authorization:'Bearer valid'}});
 assert.equal((await handler(request('/api/leads?search=lead-123'))).status,200);
 assert.equal(options.search,'lead-123');
 assert.equal((await handler(request('/api/leads?search=%25'))).status,400);
 assert.equal((await handler(request('/api/leads?search=a&search=b'))).status,400);
});

test('rejects repeated status, type and pagination query parameters',async()=>{
 const handler=createProtectedLeadsHandler({verifyToken:()=>({role:'admin',userId:'admin-1'}),leadListRepository:{list:async()=>{throw Error('must not query');}}});
 for(const url of ['/api/leads?status=received&status=quoted','/api/leads?insuranceType=auto&insuranceType=life','/api/leads?limit=10&limit=100','/api/leads?offset=0&offset=1']){
  const response=await handler({method:'GET',url,headers:{authorization:'Bearer valid'}});
  assert.equal(response.status,400,url);
 }
});

test('HTTP listing rejects unknown query keys before database access',async()=>{
 const handler=createProtectedLeadsHandler({verifyToken:()=>({role:'admin',userId:'admin-1'}),leadListRepository:{list:async()=>{throw Error('unexpected query');}}});
 for(const url of ['/api/leads?ownerId=%25','/api/leads?teamId=other-team','/api/leads?status=received&debug=1']){
  const response=await handler({method:'GET',url,headers:{authorization:'Bearer valid'}});
  assert.equal(response.status,400,url);
 }
});

test('HTTP listing accepts owner and valid period, rejecting duplicate filters',async()=>{
 let options;
 const handler=createProtectedLeadsHandler({verifyToken:()=>({role:'broker',userId:'b'}),leadListRepository:{list:async(_,value)=>{options=value;return [];}}});
 const request=url=>({method:'GET',url,headers:{authorization:'Bearer valid'}});
 assert.equal((await handler(request('/api/leads?ownerId=another-user&from=2026-01-01&to=2026-02-01'))).status,200);
 assert.equal(options.ownerId,'another-user');
 assert.equal(options.from,'2026-01-01');
 assert.equal(options.to,'2026-02-01');
 assert.equal((await handler(request('/api/leads?ownerId=a&ownerId=b'))).status,400);
});
