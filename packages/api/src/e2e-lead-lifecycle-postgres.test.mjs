import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createPrismaSecureRuntime } from './secure-runtime.mjs';
import { createSessionTokenService } from '../../auth/src/token.mjs';

test('HTTP intake to broker CRM is persisted and scoped in PostgreSQL',{skip:!process.env.TEST_DATABASE_URL},async()=>{
  const {PrismaClient}=await import('@prisma/client');
  const prisma=new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
  const tokens=createSessionTokenService({secret:'integration-test-secret-longer-than-32-bytes'});
  const owner=randomUUID(),other=randomUUID(),key=randomUUID();
  const runtime=createPrismaSecureRuntime({prisma,verifyToken:tokens.verify});
  await new Promise(resolve=>runtime.server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${runtime.server.address().port}`;
  let leadId;
  try{
    const intake=await fetch(base+'/api/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      insuranceType:'auto',contact:{name:'Integration Test',email:'test@example.invalid',phone:'11999999999'},details:{vehicleModel:'Test',vehicleYear:2020},idempotencyKey:key
    })});
    assert.equal(intake.status,201,await intake.text());
    const created=await prisma.lead.findUniqueOrThrow({where:{idempotencyKey:key}});
    leadId=created.id;
    await prisma.lead.update({where:{id:leadId},data:{ownerId:owner}});
    const get=async actor=>fetch(base+'/api/leads',{headers:{authorization:`Bearer ${tokens.issue(actor)}`}});
    const own=await get({role:'broker',userId:owner});
    assert.equal(own.status,200);
    assert.ok((await own.json()).leads.some(x=>x.id===leadId));
    const denied=await get({role:'broker',userId:other});
    assert.equal(denied.status,200);
    assert.ok(!(await denied.json()).leads.some(x=>x.id===leadId));
    const auth={authorization:`Bearer ${tokens.issue({role:'broker',userId:owner})}`};
    const changed=await fetch(base+`/api/leads/${leadId}/status`,{
      method:'PATCH',headers:{...auth,'content-type':'application/json'},body:JSON.stringify({status:'processing'})
    });
    assert.equal(changed.status,200);
    const history=await fetch(base+`/api/leads/${leadId}/status-history`,{headers:auth});
    assert.equal(history.status,200);
    assert.ok((await history.json()).history.some(x=>x.toStatus==='processing'));
    const otherHistory=await fetch(base+`/api/leads/${leadId}/status-history`,{headers:{authorization:`Bearer ${tokens.issue({role:'broker',userId:other})}`}});
    assert.equal(otherHistory.status,404);
    const duplicate=await fetch(base+'/api/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      insuranceType:'auto',contact:{name:'Integration Test',email:'test@example.invalid',phone:'11999999999'},details:{vehicleModel:'Test',vehicleYear:2020},idempotencyKey:key
    })});
    assert.equal(duplicate.status,409);
  }finally{
    try{if(leadId)await prisma.leadStatusHistory.deleteMany({where:{leadId}});await prisma.lead.deleteMany({where:{idempotencyKey:key}});}
    finally{await runtime.close();}
  }
});
