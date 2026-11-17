import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionTokenService } from './token.mjs';
import { createRevocableVerifier } from './revocable-verifier.mjs';
test('rejects revoked sessions and fails closed when storage fails', async () => {
  const tokens = createSessionTokenService({secret:'a'.repeat(32)});
  const actor = {userId:'a',role:'admin'};
  const token = tokens.issue(actor);
  let revoked = false;
  const verify = createRevocableVerifier({tokens,repository:{isRevoked:async()=>revoked}});
  assert.deepEqual(await verify(token),actor);
  revoked=true;
  assert.equal(await verify(token),null);
  assert.equal(await verify('invalid'),null);
  const unavailable=createRevocableVerifier({tokens,repository:{isRevoked:async()=>{throw new Error('offline');}}});
  assert.equal(await unavailable(token),null);
});
