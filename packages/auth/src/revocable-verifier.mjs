export function createRevocableVerifier({tokens,repository}) {
  if(typeof tokens?.verifySession!=='function'||typeof repository?.isRevoked!=='function')throw new TypeError('Session tokens and revocation repository required');
  return async function verify(token) {
    try {
      const session=tokens.verifySession(token);
      if(!session?.sessionId||await repository.isRevoked(session.sessionId))return null;
      return session.actor;
    } catch { return null; }
  };
}
