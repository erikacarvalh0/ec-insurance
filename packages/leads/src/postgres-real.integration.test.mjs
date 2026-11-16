import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

const enabled=Boolean(process.env.TEST_DATABASE_URL);
const options={skip:enabled?false:'Set TEST_DATABASE_URL to a disposable migrated PostgreSQL database'};

test('real PostgreSQL enforces lead idempotency uniqueness',options,async()=>{
 const {PrismaClient}=await import('@prisma/client');
 const prisma=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
 const key=randomUUID();const id=randomUUID();
 const data={id,insuranceType:'AUTO',contactName:'Integration Test',contactEmail:'test@example.invalid',contactPhone:'000',idempotencyKey:key};
 try{
  await prisma.lead.create({data});
  await assert.rejects(prisma.lead.create({data:{...data,id:randomUUID()}}),error=>error?.code==='P2002');
 }finally{await prisma.lead.deleteMany({where:{idempotencyKey:key}});await prisma.$disconnect();}
});

test('real PostgreSQL rolls back a failed status and audit transaction',options,async()=>{
 const {PrismaClient}=await import('@prisma/client');
 const {createPrismaLeadStatusRepository}=await import('./status-repository.mjs');
 const prisma=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
 const id=randomUUID();const ownerId=randomUUID();
 try{
  await prisma.lead.create({data:{id,insuranceType:'AUTO',contactName:'Rollback Test',contactEmail:'test@example.invalid',contactPhone:'000',idempotencyKey:randomUUID(),ownerId}});
  const failHistory={ $transaction:(run)=>prisma.$transaction((tx)=>run({lead:tx.lead,leadStatusHistory:{create:async()=>{throw new Error('Simulated audit write failure');}}})) };
  const repo=createPrismaLeadStatusRepository(failHistory);
  await assert.rejects(repo.updateStatus({role:'broker',userId:ownerId},id,'contacted'),/Simulated audit write failure/);
  const lead=await prisma.lead.findUnique({where:{id}});
  assert.equal(lead.status,'RECEIVED');
  assert.equal(await prisma.leadStatusHistory.count({where:{leadId:id}}),0);
 }finally{await prisma.leadStatusHistory.deleteMany({where:{leadId:id}});await prisma.lead.deleteMany({where:{id}});await prisma.$disconnect();}
});
