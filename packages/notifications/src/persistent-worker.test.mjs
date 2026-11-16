import assert from 'node:assert/strict';
import test from 'node:test';
import { createNotificationWorker } from './persistent-worker.mjs';

function fixture({fail=false,attempts=0}={}){
 const updates=[];let status='PENDING';const job={id:'j1',subject:'Hello',body:'Message',idempotencyKey:'k',attempts};
 const prisma={notificationJob:{findFirst:async()=>status==='PENDING'?job:null,updateMany:async({where,data})=>{if(status!==where.status)return{count:0};status=data.status;updates.push(data);return{count:1};},update:async({data})=>{status=data.status;updates.push(data);}}};
 const worker=createNotificationWorker({prisma,adapter:{send:async()=>{if(fail)throw Error('temporary');}},now:()=>new Date('2026-11-16T20:00:00Z'),maxAttempts:3});return{worker,updates};
}
test('claims and marks a delivered job',async()=>{const {worker,updates}=fixture();assert.equal((await worker.processOne()).status,'sent');assert.deepEqual(updates.map(x=>x.status),['PROCESSING','SENT']);});
test('schedules bounded exponential retry on failure',async()=>{const {worker,updates}=fixture({fail:true,attempts:1});assert.equal((await worker.processOne()).status,'retry');assert.equal(updates[1].attempts,2);assert.equal(updates[1].nextAttemptAt.toISOString(),'2026-11-16T20:00:04.000Z');});
test('dead letters after max attempts',async()=>{const {worker,updates}=fixture({fail:true,attempts:2});assert.equal((await worker.processOne()).status,'dead-letter');assert.equal(updates[1].status,'DEAD_LETTER');});
