import assert from 'node:assert/strict';
import test from 'node:test';
import { createProtectedLeadDetailHandler } from './lead-detail-handler.mjs';

test('returns role-scoped detail for authenticated actor',async()=>{
  let requested;
  const handler=createProtectedLeadDetailHandler({verifyToken:()=>({role:'broker',userId:'b1'}),leadDetailRepository:{findById:async(actor,id)=>{requested={actor,id};return{id,status:'received'};}}});
  const result=await handler({method:'GET',url:'/api/leads/lead-1',headers:{authorization:'Bearer signed'}});
  assert.equal(result.status,200);
  assert.equal(requested.id,'lead-1');
  assert.equal(requested.actor.userId,'b1');
});

test('rejects unauthenticated and missing leads',async()=>{
  const handler=createProtectedLeadDetailHandler({verifyToken:()=>null,leadDetailRepository:{findById:async()=>null}});
  assert.equal((await handler({method:'GET',url:'/api/leads/lead-1',headers:{}})).status,401);
  const authorized=createProtectedLeadDetailHandler({verifyToken:()=>({role:'broker',userId:'b1'}),leadDetailRepository:{findById:async()=>null}});
  assert.equal((await authorized({method:'GET',url:'/api/leads/lead-1',headers:{authorization:'Bearer signed'}})).status,404);
});

test('rejects invalid credentials before accessing lead details', async () => {
  for (const authorization of [undefined, 'Basic signed', 'Bearer ', 'Bearer signed extra', 'Bearer signed']) {
    let repositoryCalls = 0;
    const handler = createProtectedLeadDetailHandler({
      verifyToken: () => { throw new Error('Invalid signature'); },
      leadDetailRepository: {
        findById: async () => { repositoryCalls += 1; },
      },
    });

    const result = await handler({
      method: 'GET',
      url: '/api/leads/lead-1',
      headers: { authorization },
    });

    assert.deepEqual(result, { status: 401, body: { error: 'Unauthorized' } });
    assert.equal(repositoryCalls, 0);
  }
});

test('maps repository failures without exposing internal error details', async () => {
  for (const [message, status, error] of [
    ['Forbidden', 403, 'Forbidden'],
    ['Database connection failed: private credentials', 500, 'Internal server error'],
  ]) {
    const handler = createProtectedLeadDetailHandler({
      verifyToken: () => ({ role: 'broker', userId: 'b1' }),
      leadDetailRepository: {
        findById: async () => { throw new Error(message); },
      },
    });

    const result = await handler({
      method: 'GET',
      url: '/api/leads/lead-1',
      headers: { authorization: 'Bearer signed' },
    });

    assert.deepEqual(result, { status, body: { error } });
  }
});
