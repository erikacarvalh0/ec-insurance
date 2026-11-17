import test from 'node:test';
import assert from 'node:assert/strict';
import { logoutBroker } from './client.mjs';
test('sends bearer logout and surfaces server failure', async () => {
  await logoutBroker('token',{fetcher:async(url,options)=>{
    assert.equal(url,'/api/logout');assert.equal(options.method,'POST');assert.equal(options.headers.Authorization,'Bearer token');
    return {ok:true,status:204};
  }});
  await assert.rejects(logoutBroker('token',{fetcher:async()=>({ok:false,status:503})}));
});
