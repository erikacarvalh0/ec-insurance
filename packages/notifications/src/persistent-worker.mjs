export function createNotificationWorker({prisma,adapter,now=()=>new Date(),maxAttempts=5}={}){
 if(typeof prisma?.notificationJob?.findFirst!=='function'||typeof prisma?.notificationJob?.updateMany!=='function'||typeof prisma?.notificationJob?.update!=='function'||typeof adapter?.send!=='function')throw new TypeError('Persistent job repository and adapter required');
 if(!Number.isSafeInteger(maxAttempts)||maxAttempts<1)throw new RangeError('Invalid maxAttempts');
 return{
  async processOne(){
   const job=await prisma.notificationJob.findFirst({where:{status:'PENDING',nextAttemptAt:{lte:now()}},orderBy:[{nextAttemptAt:'asc'},{createdAt:'asc'}]});
   if(!job)return{status:'idle'};
   const claim=await prisma.notificationJob.updateMany({where:{id:job.id,status:'PENDING',attempts:job.attempts},data:{status:'PROCESSING'}});
   if(claim.count!==1)return{status:'contended'};
   try{
    await adapter.send({idempotencyKey:job.idempotencyKey,subject:job.subject,body:job.body});
    await prisma.notificationJob.update({where:{id:job.id},data:{status:'SENT',attempts:job.attempts+1}});
    return{status:'sent'};
   }catch{
    const attempts=job.attempts+1;
    const dead=attempts>=maxAttempts;
    const delayMs=Math.min(3600_000,1000*2**Math.min(attempts,12));
    await prisma.notificationJob.update({where:{id:job.id},data:{status:dead?'DEAD_LETTER':'PENDING',attempts,...(dead?{}:{nextAttemptAt:new Date(now().getTime()+delayMs)})}});
    return{status:dead?'dead-letter':'retry'};
   }
  }
 };
}
