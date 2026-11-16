export function createNotificationWorker({prisma,adapter,now=()=>new Date(),maxAttempts=5,leaseMs=60000}={}){
 if(typeof prisma?.notificationJob?.findFirst!=='function'||typeof prisma?.notificationJob?.updateMany!=='function'||typeof adapter?.send!=='function')throw new TypeError('Persistent job repository and adapter required');
 if(!Number.isSafeInteger(leaseMs)||leaseMs<1000)throw new RangeError('Invalid leaseMs');
 if(!Number.isSafeInteger(maxAttempts)||maxAttempts<1)throw new RangeError('Invalid maxAttempts');
 return{
  async processOne(){
   const job=await prisma.notificationJob.findFirst({where:{status:'PENDING',nextAttemptAt:{lte:now()}},orderBy:[{nextAttemptAt:'asc'},{createdAt:'asc'}]});
   if(!job)return{status:'idle'};
   const leaseExpiresAt=new Date(now().getTime()+leaseMs);
   const claim=await prisma.notificationJob.updateMany({where:{id:job.id,status:'PENDING',attempts:job.attempts},data:{status:'PROCESSING',leaseExpiresAt}});
   if(claim.count!==1)return{status:'contended'};
   try{
    await adapter.send({idempotencyKey:job.idempotencyKey,subject:job.subject,body:job.body});
    const completed=await prisma.notificationJob.updateMany({where:{id:job.id,status:'PROCESSING',attempts:job.attempts,AND:[{leaseExpiresAt},{leaseExpiresAt:{gt:now()}}]},data:{status:'SENT',leaseExpiresAt:null,attempts:job.attempts+1}});
    return{status:completed.count===1?'sent':'stale'};
   }catch{
    const attempts=job.attempts+1;
    const dead=attempts>=maxAttempts;
    const delayMs=Math.min(3600_000,1000*2**Math.min(attempts,12));
    const failed=await prisma.notificationJob.updateMany({where:{id:job.id,status:'PROCESSING',attempts:job.attempts,AND:[{leaseExpiresAt},{leaseExpiresAt:{gt:now()}}]},data:{status:dead?'DEAD_LETTER':'PENDING',leaseExpiresAt:null,attempts,...(dead?{}:{nextAttemptAt:new Date(now().getTime()+delayMs)})}});
    return{status:failed.count!==1?'stale':dead?'dead-letter':'retry'};
   }
  }
 };
}
