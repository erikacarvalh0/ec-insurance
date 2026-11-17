import assert from 'node:assert/strict';
import test from 'node:test';
import { drainNotificationQueue } from './drain.mjs';

test('drains until idle or the configured bound',async()=>{
 let calls=0;
 const worker={processOne:async()=>({status:++calls===3?'idle':'sent'})};
 assert.deepEqual(await drainNotificationQueue({worker,maxJobs:5}),{processed:2,reason:'idle'});
 calls=0;
 assert.deepEqual(await drainNotificationQueue({worker,maxJobs:2}),{processed:2,reason:'limit'});
});

test('stops on contention and propagates persistence errors',async()=>{
 assert.deepEqual(await drainNotificationQueue({worker:{processOne:async()=>({status:'contended'})}}),{processed:0,reason:'contended'});
 await assert.rejects(drainNotificationQueue({worker:{processOne:async()=>{throw Error('db unavailable');}}}),/db unavailable/);
});
