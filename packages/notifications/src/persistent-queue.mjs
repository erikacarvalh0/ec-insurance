export function createPrismaNotificationQueue(prisma){
 if(typeof prisma?.notificationJob?.create!=='function')throw new TypeError('Prisma notificationJob.create required');
 return{
  async enqueue(message){
   if(!message||typeof message.idempotencyKey!=='string'||!message.idempotencyKey.trim()||typeof message.subject!=='string'||!message.subject.trim()||typeof message.body!=='string'||!message.body.trim())throw new TypeError('Notification message is incomplete');
   try{await prisma.notificationJob.create({data:{idempotencyKey:message.idempotencyKey,subject:message.subject,body:message.body,status:'PENDING',attempts:0,nextAttemptAt:new Date()}});return{status:'queued'};}
   catch(error){if(error?.code==='P2002')return{status:'duplicate'};throw error;}
  }
 };
}
