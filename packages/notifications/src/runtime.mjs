import { createNotificationWorker } from './persistent-worker.mjs';
import { recoverStaleNotificationJobs } from './recovery.mjs';
import { createNotificationScheduler } from './scheduler.mjs';
import { startNotificationLoop } from './scheduler-loop.mjs';

export function startPersistentNotificationRuntime({prisma,adapter,intervalMs,onError,schedule,cancel}={}) {
  const worker=createNotificationWorker({prisma,adapter});
  const scheduler=createNotificationScheduler({worker,recover:()=>recoverStaleNotificationJobs({prisma})});
  return startNotificationLoop({scheduler,intervalMs,onError,schedule,cancel});
}
