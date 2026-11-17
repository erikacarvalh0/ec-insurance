export async function drainNotificationQueue({worker,maxJobs=100}={}){
 if(typeof worker?.processOne!=='function')throw new TypeError('Notification worker required');
 if(!Number.isSafeInteger(maxJobs)||maxJobs<1)throw new RangeError('Invalid maxJobs');
 let processed=0;
 while(processed<maxJobs){
  const result=await worker.processOne();
  if(['idle','contended','stale'].includes(result.status))return{processed,reason:result.status};
  if(!['sent','retry','dead-letter'].includes(result.status))throw new Error('Unexpected worker status');
  processed++;
 }
 return{processed,reason:'limit'};
}
