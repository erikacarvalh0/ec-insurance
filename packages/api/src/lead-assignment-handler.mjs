import { parseJsonBody } from './json-body.mjs';

export function createProtectedLeadAssignmentHandler({verifyToken,leadAssignmentRepository}){
 if(typeof verifyToken!=='function'||typeof leadAssignmentRepository?.assign!=='function')throw new TypeError('Verifier and assignment repository required');
 return async function handle(request){
  if(request?.method!=='PATCH')return{status:405,headers:{Allow:'PATCH'},body:{error:'Method not allowed'}};
  const authorization=request.headers?.authorization??request.headers?.Authorization;
  const match=typeof authorization==='string'&&/^Bearer ([A-Za-z0-9._~-]+)$/.exec(authorization);
  let actor;try{actor=match&&await verifyToken(match[1]);}catch{}
  if(!actor)return{status:401,body:{error:'Unauthorized'}};
  const path=/^\/api\/leads\/([A-Za-z0-9_-]{1,128})\/assignment$/.exec((request.url??'').split('?')[0]);
  if(!path)return{status:404,body:{error:'Not found'}};
  if(!request.headers?.['content-type']?.toLowerCase().startsWith('application/json'))return{status:415,body:{error:'JSON content type required'}};
  let body;try{body=await parseJsonBody(request,{maxBytes:4096});}catch(error){return{status:error instanceof RangeError?413:400,body:{error:'Invalid JSON request'}};}
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==1||typeof body.assigneeId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(body.assigneeId))return{status:400,body:{error:'Invalid assignment'}};
  try{const lead=await leadAssignmentRepository.assign(actor,path[1],body.assigneeId);return lead?{status:200,headers:{'Cache-Control':'no-store'},body:{lead}}:{status:404,body:{error:'Not found'}};}
  catch(error){if(error?.message==='Forbidden')return{status:403,body:{error:'Forbidden'}};if(['Invalid assignee','Already assigned','Lead changed concurrently','Unassigned team'].includes(error?.message))return{status:409,body:{error:'Assignment conflict'}};return{status:500,body:{error:'Internal server error'}};}
 };
}
