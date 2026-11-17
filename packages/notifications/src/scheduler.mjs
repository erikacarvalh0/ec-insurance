import { drainNotificationQueue } from './drain.mjs';

export function createNotificationScheduler({worker,recover,maxJobs=100}={}) {
  if(typeof worker?.processOne!=='function'||typeof recover!=='function')throw new TypeError('Worker and recovery required');
  if(!Number.isSafeInteger(maxJobs)||maxJobs<1)throw new RangeError('Invalid maxJobs');
  let running;
  return {
    tick() {
      if(running)return running;
      running=(async()=>{
        await recover();
        return drainNotificationQueue({worker,maxJobs});
      })().finally(()=>{running=undefined;});
      return running;
    },
  };
}
