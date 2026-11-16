import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

const enabled=Boolean(process.env.TEST_DATABASE_URL);

test('real HTTP intake persists lead once and rejects duplicate idempotency keys',{skip:enabled?false:'Requires disposable migrated TEST_DATABASE_URL'},async()=>{
 const {PrismaClient}=await import('@prisma/client');
 const {createPrismaSecureRuntime}=await import('./secure-runtime.mjs');
 const {createSessionTokenService}=await import('../../auth/src/token.mjs');
 const prisma=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
 const tokens=createSessionTokenService({secret:'i'.repeat(64)});
 const runtime=createPrismaSecureRuntime({prisma,verifyToken:tokens.verify});
 const key=randomUUID();
 try{
  await new Promise(resolve=>runtime.server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${runtime.server.address().port}/api/intake`;
  const request={method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({insuranceType:'auto',idempotencyKey:key,contact:{name:'Intake E2E',email:'intake@example.invalid',phone:'11987654321'},details:{vehicleModel:'Sedan',vehicleYear:2024}})};
  const first=await fetch(url,request);assert.equal(first.status,201);
  const result=await first.json();assert.equal(result.lead.insuranceType,'auto');
  assert.equal(await prisma.lead.count({where:{idempotencyKey:key}}),1);
  const duplicate=await fetch(url,request);assert.equal(duplicate.status,409);
  assert.equal(await prisma.lead.count({where:{idempotencyKey:key}}),1);
 }finally{
  if(runtime.server.listening)await new Promise(resolve=>runtime.server.close(resolve));
  await prisma.lead.deleteMany({where:{idempotencyKey:key}});
  await prisma.$disconnect();
 }
});
