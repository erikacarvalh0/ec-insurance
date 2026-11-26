import { EcdsButton } from '../../ecds-v1.mjs';
import { createElement as h, useEffect, useState } from 'react';
import { fetchLeadDetails } from './lead-details-client.mjs';

export function LeadDetails({token,leadId,fetchDetails=fetchLeadDetails,onClose}){
 const [state,setState]=useState({status:'loading'});
 useEffect(()=>{
  if(!token||!leadId){setState({status:'idle'});return;}
  let active=true;setState({status:'loading'});
  fetchDetails({token,leadId}).then(data=>{if(active)setState({status:'success',...data});},()=>{if(active)setState({status:'error'});});
  return()=>{active=false;};
 },[token,leadId,fetchDetails]);
 if(!leadId||!token)return h('p',null,'Select a lead to view details');
 return h('section',{'aria-label':'Lead details'},
  h('h2',null,'Lead details'),
  h(EcdsButton,{type:'button',onClick:onClose},'Close details'),
  state.status==='loading'?h('p',{role:'status'},'Loading lead details...'):
  state.status==='error'?h('p',{role:'alert'},'Unable to load lead details'):
  state.status==='success'?h('div',null,
    h('dl',null,h('dt',null,'Insurance'),h('dd',null,state.lead.insuranceType),h('dt',null,'Status'),h('dd',null,state.lead.status)),
    h('h3',null,'Status history'),
    state.history.length===0?h('p',null,'No status changes yet'):
      h('ol',null,...state.history.map(entry=>h('li',{key:entry.id},`${entry.fromStatus} → ${entry.toStatus} — ${entry.createdAt}`)))):null);
}
