import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createPrismaLeadListRepository } from './list-repository.mjs';

test('PostgreSQL scopes lead listings by broker, team and owner filter', {skip: !process.env.TEST_DATABASE_URL}, async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
  const prefix = randomUUID();
  const ids = [randomUUID(), randomUUID()];
  const owners = [randomUUID(), randomUUID()];
  const teams = [randomUUID(), randomUUID()];
  try {
    await prisma.lead.createMany({data: ids.map((id,i)=>({
      id, insuranceType:'AUTO', contactName:'Integration Test',
      contactEmail:'test@example.invalid', contactPhone:'0000000000',
      idempotencyKey:`${prefix}-${i}`, ownerId:owners[i], teamId:teams[i]
    }))});
    const list = createPrismaLeadListRepository(prisma);
    const broker = await list.list({role:'broker',userId:owners[0]},{search:ids[0].slice(0,8)});
    assert.deepEqual(broker.map(x=>x.id),[ids[0]]);
    assert.deepEqual(await list.list({role:'broker',userId:owners[0]},{ownerId:owners[1]}),[]);
    const manager = await list.list({role:'manager',userId:randomUUID(),teamId:teams[0]},{ownerId:owners[1]});
    assert.deepEqual(manager,[]);
    const admin = await list.list({role:'admin',userId:randomUUID()},{ownerId:owners[1]});
    assert.ok(admin.some(x=>x.id===ids[1]));
    assert.ok(broker.every(x=>!('contactEmail' in x)));
  } finally {
    try {await prisma.lead.deleteMany({where:{id:{in:ids}}});}
    finally {await prisma.$disconnect();}
  }
});
