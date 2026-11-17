export function createHttpLogoutHandler({tokens,repository}) {
  if(typeof tokens?.verifySession!=='function'||typeof repository?.revoke!=='function')throw new TypeError('Logout dependencies required');
  return async function logout(request) {
    if(request?.method!=='POST')return {status:405,headers:{Allow:'POST'},body:{error:'Method not allowed'}};
    const header=request.headers?.authorization??request.headers?.Authorization;
    const match=typeof header==='string'&&/^Bearer ([A-Za-z0-9._~-]+)$/.exec(header);
    const session=match&&tokens.verifySession(match[1]);
    if(!session?.sessionId)return {status:401,body:{error:'Unauthorized'}};
    try {
      await repository.revoke({sessionId:session.sessionId,expiresAt:session.expiresAt});
      return {status:204,headers:{'Cache-Control':'no-store'}};
    } catch {return {status:503,body:{error:'Service unavailable'}};}
  };
}
