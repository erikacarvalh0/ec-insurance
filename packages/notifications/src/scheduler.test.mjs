import test from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationScheduler } from './scheduler.mjs';
test('coalesces concurrent ticks and recovers before draining', async () => {
  let release;
  const calls=[];
  const scheduler=createNotificationScheduler({recover:async()=>{calls.push('recover');await new Promise(r=>release=r);},worker:{processOne:async()=>{calls.push('drain');return {status:'idle'};}}});
  const first=scheduler.tick();
  const second=scheduler.tick();
  assert.equal(first,second);
  release();
  assert.deepEqual(await first,{processed:0,reason:'idle'});
  assert.deepEqual(calls,['recover','drain']);
});
