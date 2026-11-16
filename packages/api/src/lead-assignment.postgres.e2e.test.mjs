import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

const enabled=Boolean(process.env.TEST_DATABASE_URL);

test('real HTTP and PostgreSQL: manager assigns within team and records audit; cross-team broker rejected',{skip:enabled?false:'Requires disposable migrated TEST_DATABASE_URL'},async()=>{
 const {PrismaClient}=await import('@prisma/client');
 const {createPrismaSecureRuntime}=await import('./secure-runtime.mjs');
 const {createSessionTokenService}=await import('../../auth/src/token.mjs');
 const prisma=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
 const tokens=createSessionTokenService({secret:'a'.repeat(64)});
 const runtime=createPrismaSecureRuntime({prisma,verifyToken:tokens.verify});
 const id=randomUUID(),managerId=randomUUID(),brokerId=randomUUID(),outsiderId=randomUUID(),teamId=randomUUID();
 try{
  await prisma.user.createMany({data:[{id:brokerId,email:`${brokerId}@example.invalid`,passwordHash:'unused',role:'BROKER',teamId,active:true},{id:outsiderId,email:`${outsiderId}@example.invalid`,passwordHash:'unused',role:'BROKER',teamId:randomUUID(),active:true}]});
  await prisma.lead.create({data:{id,insuranceType:'AUTO',contactName:'Assignment E2E',contactEmail:'test@example.invalid',contactPhone:'000',idempotencyKey:randomUUID(),teamId}});
  await new Promise(resolve=>runtime.server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${runtime.server.address().port}/api/leads/${id}/assignment`;
  const headers={authorization:`Bearer ${tokens.issue({userId:managerId,role:'manager',teamId})}`,'content-type':'application/json'};
  const outside=await fetch(url,{method:'PATCH',headers,body:JSON.stringify({assigneeId:outsiderId})});assert.equal(outside.status,409);
  const accepted=await fetch(url,{method:'PATCH',headers,body:JSON.stringify({assigneeId:brokerId})});assert.equal(accepted.status,200);
  assert.equal((await prisma.lead.findUnique({where:{id}})).ownerId,brokerId);
  const audit=await prisma.leadAssignmentHistory.findMany({where:{leadId:id}});
  assert.equal(audit.length,1);assert.equal(audit[0].actorId,managerId);assert.equal(audit[0].toOwnerId,brokerId);
 }finally{
  if(runtime.server.listening)await new Promise(resolve=>runtime.server.close(resolve));
  await prisma.leadAssignmentHistory.deleteMany({where:{leadId:id}});
  await prisma.lead.deleteMany({where:{id}});
  await prisma.user.deleteMany({where:{id:{in:[brokerId,outsiderId]}}});
  await prisma.$disconnect();
 }
});
