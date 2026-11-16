import assert from 'node:assert/strict';
import test from 'node:test';
import { createSecureApiServer } from './secure-server.mjs';

test('GET /api/leads/:id routes to protected lead detail',async(t)=>{
  const server=createSecureApiServer({leadRepository:{create:async()=>({id:'x'})},checkDatabase:async()=>true,verifyToken:()=>({role:'broker',userId:'b1'}),leadListRepository:{list:async()=>[]},leadDetailRepository:{findById:async(_actor,id)=>({id,status:'received'})}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/leads/lead-1`,{headers:{Authorization:'Bearer signed'}});
  assert.equal(response.status,200);
  assert.deepEqual((await response.json()).lead,{id:'lead-1',status:'received'});
});
