import assert from 'node:assert/strict';
import test from 'node:test';
import { createProtectedLeadsHandler } from './leads-handler.mjs';

test('passes bounded pagination parameters to scoped repository', async () => {
  let options;
  const handle = createProtectedLeadsHandler({ verifyToken: () => ({ role:'broker',userId:'b1' }), leadListRepository: { list: async (_actor, pagination) => { options = pagination; return []; } } });
  const response = await handle({method:'GET',url:'/api/leads?limit=20&offset=40',headers:{authorization:'Bearer signed'}});
  assert.equal(response.status,200);
  assert.deepEqual(options,{limit:20,offset:40});
});

test('rejects invalid pagination without querying repository', async () => {
  let queried = false;
  const handle = createProtectedLeadsHandler({ verifyToken: () => ({role:'broker',userId:'b1'}), leadListRepository:{list:async()=>{queried=true;return[];}} });
  const response = await handle({method:'GET',url:'/api/leads?limit=101',headers:{authorization:'Bearer signed'}});
  assert.equal(response.status,400);
  assert.equal(queried,false);
});
