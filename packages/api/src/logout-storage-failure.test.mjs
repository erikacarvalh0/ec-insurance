import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionTokenService } from '../../auth/src/token.mjs';
import { createHttpLogoutHandler } from './http-logout.mjs';
test('logout never claims success when revocation storage fails',async()=>{
 const tokens=createSessionTokenService({secret:'a'.repeat(32)});
 const token=tokens.issue({userId:'broker',role:'broker'});
 let unavailable=true;
 const ids=new Set();
 const logout=createHttpLogoutHandler({tokens,repository:{revoke:async ({sessionId})=>{if(unavailable)throw Error('offline');ids.add(sessionId);}}});
 const request={method:'POST',headers:{authorization:`Bearer ${token}`}};
 assert.equal((await logout(request)).status,503);
 assert.equal(ids.size,0);
 unavailable=false;
 assert.equal((await logout(request)).status,204);
 assert.equal((await logout(request)).status,204);
 assert.equal(ids.size,1);
});
