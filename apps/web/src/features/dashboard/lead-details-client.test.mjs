import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchLeadDetails } from './lead-details-client.mjs';

test('loads scoped lead and history without exposing credentials in URLs',async()=>{
 const calls=[];
 const fetcher=async(url,opts)=>{calls.push({url,opts});return{ok:true,json:async()=>url.endsWith('status-history?limit=20&offset=0')?{history:[]}:{lead:{id:'l1',status:'received'}}};};
 const data=await fetchLeadDetails({token:'signed',leadId:'l1',fetcher});
 assert.equal(data.lead.id,'l1');assert.deepEqual(data.history,[]);
 assert.deepEqual(calls.map(c=>c.url),['/api/leads/l1','/api/leads/l1/status-history?limit=20&offset=0']);
 assert.ok(calls.every(c=>c.opts.headers.Authorization==='Bearer signed'));
});

test('rejects unsafe lead IDs and invalid responses',async()=>{
 await assert.rejects(fetchLeadDetails({token:'signed',leadId:'../private'}),/Invalid lead ID/);
 await assert.rejects(fetchLeadDetails({token:'signed',leadId:'l1',fetcher:async()=>({ok:false,status:403})}),/Unable to load lead/);
});
