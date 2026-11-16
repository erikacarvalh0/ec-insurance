import assert from 'node:assert/strict';
import test from 'node:test';
import { createSecureApiServer } from './secure-server.mjs';

test('returns a generated request ID for rejected requests',async(t)=>{
  const server=createSecureApiServer({leadRepository:{create:async()=>({id:'new'})},checkDatabase:async()=>true,verifyToken:()=>null,leadListRepository:{list:async()=>[]}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const response=await fetch(`http://127.0.0.1:${server.address().port}/api/leads?token=secret`);
  assert.equal(response.status,401);
  assert.match(response.headers.get('x-request-id'),/^[0-9a-f-]{36}$/);
});
