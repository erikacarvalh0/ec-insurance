import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchBrokerLeads } from './client.mjs';

test('requests paginated leads using authenticated API', async () => {
  let requested;
  const leads = await fetchBrokerLeads({ token:'signed',limit:20,offset:40,fetcher:async(url,options)=>{requested={url,options};return{ok:true,json:async()=>({leads:[]})};} });
  assert.deepEqual(leads,[]);
  assert.equal(requested.url,'/api/leads?limit=20&offset=40');
  assert.equal(requested.options.headers.Authorization,'Bearer signed');
});

test('rejects invalid pagination before network request', async () => {
  let called=false;
  await assert.rejects(fetchBrokerLeads({token:'signed',limit:0,fetcher:async()=>{called=true;}}),/Invalid pagination/);
  assert.equal(called,false);
});
