export async function recoverStaleNotificationJobs({prisma,now=()=>new Date()}={}){
 if(typeof prisma?.notificationJob?.updateMany!=='function')throw new TypeError('notificationJob.updateMany required');
 const current=now();
 const result=await prisma.notificationJob.updateMany({where:{status:'PROCESSING',leaseExpiresAt:{lte:current}},data:{status:'PENDING',leaseExpiresAt:null,nextAttemptAt:current}});
 return{recovered:result.count};
}
