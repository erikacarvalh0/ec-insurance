import assert from 'node:assert/strict';
import test from 'node:test';
import { createProtectedLeadAssignmentHandler } from './lead-assignment-handler.mjs';

function request(body,token='valid') {return {method:'PATCH',url:'/api/leads/lead-1/assignment',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},async *[Symbol.asyncIterator](){yield Buffer.from(JSON.stringify(body));}};}

test('authenticated manager assigns a lead and receives no-store response',async()=>{
 const calls=[];const handler=createProtectedLeadAssignmentHandler({verifyToken:()=>({role:'manager',userId:'m',teamId:'t'}),leadAssignmentRepository:{assign:async(...args)=>{calls.push(args);return{id:'lead-1',ownerId:'broker-1'};}}});
 const result=await handler(request({assigneeId:'broker-1'}));assert.equal(result.status,200);assert.equal(result.headers['Cache-Control'],'no-store');assert.equal(calls[0][1],'lead-1');
});
test('rejects unauthorized, invalid and missing assignments',async()=>{
 const handler=createProtectedLeadAssignmentHandler({verifyToken:(token)=>token==='valid'?{role:'broker',userId:'b'}:null,leadAssignmentRepository:{assign:async()=>null}});
 assert.equal((await handler(request({assigneeId:'broker-1'},'invalid'))).status,401);
 assert.equal((await handler(request({assigneeId:'../bad'}))).status,400);
 assert.equal((await handler(request({assigneeId:'broker-1'}))).status,404);
});
test('maps forbidden, invalid assignee and concurrency to safe statuses',async()=>{
 for(const [message,status] of [['Forbidden',403],['Invalid assignee',409],['Lead changed concurrently',409]]){
  const handler=createProtectedLeadAssignmentHandler({verifyToken:()=>({role:'manager',userId:'m'}),leadAssignmentRepository:{assign:async()=>{throw Error(message);}}});
  assert.equal((await handler(request({assigneeId:'broker-1'}))).status,status);
 }
});
