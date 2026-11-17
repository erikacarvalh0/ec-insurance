import test from 'node:test';
import assert from 'node:assert/strict';
import { startNotificationLoop } from './scheduler-loop.mjs';
test('runs immediately, schedules after completion and stops cleanly', async () => {
  let next, calls=0, cleared=false;
  const loop=startNotificationLoop({scheduler:{tick:async()=>{calls++;}},schedule:fn=>{next=fn;return 1;},cancel:()=>{cleared=true;}});
  await loop.ready;
  assert.equal(calls,1);
  assert.equal(typeof next,'function');
  await loop.stop();
  assert.equal(cleared,true);
  await next();
  assert.equal(calls,1);
});
