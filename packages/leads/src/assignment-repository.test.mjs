import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrismaLeadAssignmentRepository } from './assignment-repository.mjs';

function fixture({ ownerId='broker-old', teamId='team-1', brokerTeam='team-1', conflict=false }={}) {
 const calls=[];
 const prisma={
  user:{findFirst:async({where})=>{calls.push(['user',where]);return where.id==='broker-new'&&brokerTeam===where.teamId?{id:'broker-new'}:null;}},
  $transaction:async(run)=>run({
   lead:{findFirst:async({where})=>{calls.push(['find',where]);return where.id==='lead-1'&&(!where.teamId||where.teamId===teamId)?{ownerId,teamId}:null;},updateMany:async(x)=>{calls.push(['update',x]);return{count:conflict?0:1};}},
   leadAssignmentHistory:{create:async(x)=>{calls.push(['audit',x]);return{x};}},
  }),
 };
 return{repo:createPrismaLeadAssignmentRepository(prisma),calls};
}

test('manager reassigns only a lead and broker in the same team and audits the actor',async()=>{
 const {repo,calls}=fixture();
 assert.deepEqual(await repo.assign({role:'manager',userId:'manager-1',teamId:'team-1'},'lead-1','broker-new'),{id:'lead-1',ownerId:'broker-new'});
 assert.deepEqual(calls.find(x=>x[0]==='find')[1],{id:'lead-1',teamId:'team-1'});
 assert.equal(calls.find(x=>x[0]==='audit')[1].data.actorId,'manager-1');
 assert.equal(calls.find(x=>x[0]==='audit')[1].data.fromOwnerId,'broker-old');
});

test('broker cannot assign and out-of-team assignee cannot receive lead',async()=>{
 const a=fixture();await assert.rejects(a.repo.assign({role:'broker',userId:'b'},'lead-1','broker-new'),/Forbidden/);assert.equal(a.calls.length,0);
 const b=fixture({brokerTeam:'other'});await assert.rejects(b.repo.assign({role:'manager',userId:'m',teamId:'team-1'},'lead-1','broker-new'),/Invalid assignee/);
 assert.equal(b.calls.some(x=>x[0]==='update'),false);
});

test('concurrent update rejects without recording an audit entry',async()=>{
 const {repo,calls}=fixture({conflict:true});await assert.rejects(repo.assign({role:'admin',userId:'admin'},'lead-1','broker-new'),/concurrently/);assert.equal(calls.some(x=>x[0]==='audit'),false);
});
