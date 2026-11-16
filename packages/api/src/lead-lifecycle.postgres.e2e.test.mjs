import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

const enabled=Boolean(process.env.TEST_DATABASE_URL);

test('real database and HTTP: authenticated lead listing, status change and audit history', {skip:enabled?false:'Requires migrated disposable TEST_DATABASE_URL'},async(t)=>{
 const {PrismaClient}=await import('@prisma/client');
 const {createPrismaSecureRuntime}=await import('./secure-runtime.mjs');
 const {createSessionTokenService}=await import('../../auth/src/token.mjs');
 const prisma=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
 const tokens=createSessionTokenService({secret:'e'.repeat(64)});
 const runtime=createPrismaSecureRuntime({prisma,verifyToken:tokens.verify});
 const id=randomUUID(),ownerId=randomUUID();
 try{
  await prisma.lead.create({data:{id,insuranceType:'AUTO',contactName:'E2E',contactEmail:'e2e@example.invalid',contactPhone:'000',idempotencyKey:randomUUID(),ownerId}});
  await new Promise(resolve=>runtime.server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${runtime.server.address().port}`;
  const headers={authorization:`Bearer ${tokens.issue({userId:ownerId,role:'broker'})}`};
  const anonymous=await fetch(`${url}/api/leads`);assert.equal(anonymous.status,401);
  const list=await fetch(`${url}/api/leads`,{headers});assert.equal(list.status,200);
  assert.ok((await list.json()).leads.some(x=>x.id===id));
  const status=await fetch(`${url}/api/leads/${id}/status`,{method:'PATCH',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({status:'PROCESSING'})});
  assert.equal(status.status,200);
  const history=await fetch(`${url}/api/leads/${id}/status-history`,{headers});
  assert.equal(history.status,200);
  assert.equal(await prisma.leadStatusHistory.count({where:{leadId:id}}),1);
 }finally{
  if(runtime.server.listening)await new Promise(resolve=>runtime.server.close(resolve));
  await prisma.leadStatusHistory.deleteMany({where:{leadId:id}});
  await prisma.lead.deleteMany({where:{id}});
  await prisma.$disconnect();
 }
});
