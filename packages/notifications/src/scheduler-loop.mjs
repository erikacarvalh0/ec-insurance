export function startNotificationLoop({scheduler,intervalMs=5000,schedule=setTimeout,cancel=clearTimeout,onError=()=>{}}={}) {
  if(typeof scheduler?.tick!=='function'||!Number.isSafeInteger(intervalMs)||intervalMs<100)throw new TypeError('Invalid scheduler configuration');
  let stopped=false,timer,active;
  function run() {
    if(stopped)return;
    active=Promise.resolve().then(()=>scheduler.tick()).catch(error=>{try{onError(error);}catch{}}).finally(()=>{
      if(!stopped)timer=schedule(run,intervalMs);
    });
    return active;
  }
  const ready=run();
  return {ready,async stop(){stopped=true;if(timer!==undefined)cancel(timer);await active;}};
}
