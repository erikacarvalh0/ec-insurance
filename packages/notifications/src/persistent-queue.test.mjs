import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaNotificationQueue } from './persistent-queue.mjs';

test('deduplicates enqueue by durable unique idempotency key',async()=>{
 const calls=[];const prisma={notificationJob:{create:async(x)=>{calls.push(x);return x.data;}}};
 const queue=createPrismaNotificationQueue(prisma);
 assert.deepEqual(await queue.enqueue({idempotencyKey:'event-1',subject:'Hello',body:'Message'}),{status:'queued'});
 assert.equal(calls[0].data.idempotencyKey,'event-1');
});
test('handles Prisma unique violation as duplicate',async()=>{
 const prisma={notificationJob:{create:async()=>{throw Object.assign(new Error('unique'),{code:'P2002'});}}};
 assert.deepEqual(await createPrismaNotificationQueue(prisma).enqueue({idempotencyKey:'event-1',subject:'Hello',body:'Message'}),{status:'duplicate'});
});
test('rejects invalid messages before database access',async()=>{
 let called=false;const prisma={notificationJob:{create:async()=>{called=true;}}};
 await assert.rejects(createPrismaNotificationQueue(prisma).enqueue({idempotencyKey:'event-1'}),/incomplete/);
 assert.equal(called,false);
});
