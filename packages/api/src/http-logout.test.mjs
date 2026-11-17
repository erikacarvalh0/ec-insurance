import test from 'node:test';
import assert from 'node:assert/strict';
import { createHttpLogoutHandler } from './http-logout.mjs';
test('logout persists signed session revocation and rejects invalid tokens', async () => {
  const calls=[];
  const handler=createHttpLogoutHandler({tokens:{verifySession:t=>t==='valid'?{sessionId:'id',expiresAt:100}:null},repository:{revoke:async s=>calls.push(s)}});
  assert.equal((await handler({method:'GET'})).status,405);
  assert.equal((await handler({method:'POST',headers:{authorization:'Bearer invalid'}})).status,401);
  assert.equal((await handler({method:'POST',headers:{authorization:'Bearer valid'}})).status,204);
  assert.deepEqual(calls,[{sessionId:'id',expiresAt:100}]);
});
