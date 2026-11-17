import test from 'node:test';
import assert from 'node:assert/strict';
import { startPersistentNotificationRuntime } from './runtime.mjs';
test('recovers then polls persistent queue and stops',async()=>{
 const calls=[];
 const runtime=startPersistentNotificationRuntime({prisma:{notificationJob:{updateMany:async()=>{calls.push('recover');return {count:0};},findFirst:async()=>{calls.push('poll');return null;}}},adapter:{send:async()=>{throw new Error('unexpected send');}},schedule:()=>1,cancel:()=>{}});
 await runtime.ready;
 await runtime.stop();
 assert.deepEqual(calls,['recover','poll']);
});
