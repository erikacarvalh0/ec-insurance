export async function fetchLeadDetails({token,leadId,fetcher=fetch}={}) {
 if(typeof token!=='string'||!token.trim())throw new TypeError('Authentication required');
 if(typeof leadId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(leadId))throw new TypeError('Invalid lead ID');
 const options={method:'GET',headers:{Authorization:`Bearer ${token}`},cache:'no-store'};
 async function get(url,key){const response=await fetcher(url,options);if(!response.ok)throw new Error('Unable to load lead details');const data=await response.json();if(key==='lead'&&(!data?.lead||data.lead.id!==leadId))throw new Error('Invalid lead details');if(key==='history'&&!Array.isArray(data?.history))throw new Error('Invalid lead history');return data[key];}
 const lead=await get(`/api/leads/${leadId}`,'lead');
 const history=await get(`/api/leads/${leadId}/status-history?limit=20&offset=0`,'history');
 return{lead,history};
}
