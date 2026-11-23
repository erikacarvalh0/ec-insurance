import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
test('PostgreSQL enforces invoice amount and idempotency constraints',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 const {PrismaClient}=await import('@prisma/client');
 const prisma=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
 const key=randomUUID();
 try {
  await prisma.invoice.create({data:{idempotencyKey:key,amountCents:100n}});
  await assert.rejects(prisma.invoice.create({data:{idempotencyKey:key,amountCents:100n}}),e=>e.code==='P2002');
  await assert.rejects(prisma.invoice.create({data:{idempotencyKey:key+'-negative',amountCents:-1n}}));
 } finally {
  try {await prisma.invoice.deleteMany({where:{idempotencyKey:{in:[key,key+'-negative']}}});}
  finally {await prisma.$disconnect();}
 }
});
