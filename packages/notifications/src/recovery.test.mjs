import assert from 'node:assert/strict';
import test from 'node:test';
import { recoverStaleNotificationJobs } from './recovery.mjs';

test('recovers only expired processing leases and preserves sent jobs',async()=>{
 const calls=[];const prisma={notificationJob:{updateMany:async(input)=>{calls.push(input);return{count:2};}}};
 const result=await recoverStaleNotificationJobs({prisma,now:()=>new Date('2026-11-16T20:00:00Z')});
 assert.deepEqual(result,{recovered:2});
 assert.deepEqual(calls[0].where,{status:'PROCESSING',leaseExpiresAt:{lte:new Date('2026-11-16T20:00:00Z')}});
 assert.equal(calls[0].data.status,'PENDING');assert.equal(calls[0].data.leaseExpiresAt,null);
});
test('rejects missing repository before recovery',async()=>{await assert.rejects(recoverStaleNotificationJobs({prisma:{}}),/notificationJob.updateMany/);});
