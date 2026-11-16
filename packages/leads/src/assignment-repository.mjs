export function createPrismaLeadAssignmentRepository(prisma) {
 if(typeof prisma?.$transaction!=='function'||typeof prisma?.user?.findFirst!=='function')throw new TypeError('Prisma transaction and user lookup required');
 return{
  async assign(actor,id,assigneeId){
   if(!actor?.userId||!['manager','admin'].includes(actor.role)||(actor.role==='manager'&&!actor.teamId))throw new Error('Forbidden');
   if(![id,assigneeId].every(x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(x)))throw new TypeError('Invalid assignment');
   return prisma.$transaction(async(tx)=>{
    const where={id,...(actor.role==='manager'?{teamId:actor.teamId}:{})};
    const lead=await tx.lead.findFirst({where,select:{ownerId:true,teamId:true}});
    if(!lead)return null;
    if(!lead.teamId)throw new Error('Unassigned team');
    const user=await tx.user.findFirst({where:{id:assigneeId,teamId:lead.teamId,role:'BROKER',active:true},select:{id:true}});
    if(!user)throw new Error('Invalid assignee');
    if(lead.ownerId===assigneeId)throw new Error('Already assigned');
    const result=await tx.lead.updateMany({where:{...where,ownerId:lead.ownerId},data:{ownerId:assigneeId}});
    if(result.count!==1)throw new Error('Lead changed concurrently');
    await tx.leadAssignmentHistory.create({data:{leadId:id,actorId:actor.userId,fromOwnerId:lead.ownerId,toOwnerId:assigneeId}});
    return{id,ownerId:assigneeId};
   });
  }
 };
}
