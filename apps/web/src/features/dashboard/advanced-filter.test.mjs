import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchBrokerLeads} from './client.mjs';
test('sends broker and UTC period filters',async()=>{
 await fetchBrokerLeads({token:'token',ownerId:'broker-1',from:'2026-01-01',to:'2026-02-01',fetcher:async url=>{const q=new URL(url,'http://localhost').searchParams;assert.equal(q.get('ownerId'),'broker-1');assert.equal(q.get('from'),'2026-01-01');assert.equal(q.get('to'),'2026-02-01');return {ok:true,json:async()=>({leads:[]})};}});
 await assert.rejects(fetchBrokerLeads({token:'token',from:'2026-02-30'}));
});
