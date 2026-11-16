export function createProtectedLeadDetailHandler({ verifyToken, leadDetailRepository }) {
  if (typeof verifyToken !== 'function' || typeof leadDetailRepository?.findById !== 'function') throw new TypeError('Verifier and lead detail repository are required');
  return async function handleLeadDetail(request) {
    if (request?.method !== 'GET') return { status: 405, headers: { Allow: 'GET' }, body: { error: 'Method not allowed' } };
    const auth = request?.headers?.authorization ?? request?.headers?.Authorization;
    const match = typeof auth === 'string' && /^Bearer ([A-Za-z0-9._~-]+)$/.exec(auth);
    if (!match) return { status: 401, body: { error: 'Unauthorized' } };
    let actor;
    try { actor = verifyToken(match[1]); } catch { return { status: 401, body: { error: 'Unauthorized' } }; }
    if (!actor) return { status: 401, body: { error: 'Unauthorized' } };
    const path = (request.url ?? '').split('?')[0];
    const matchPath = /^\/api\/leads\/([A-Za-z0-9_-]{1,128})$/.exec(path);
    if (!matchPath) return { status: 404, body: { error: 'Not found' } };
    try {
      const lead = await leadDetailRepository.findById(actor, matchPath[1]);
      return lead ? { status: 200, headers: { 'Cache-Control': 'no-store' }, body: { lead } } : { status: 404, body: { error: 'Not found' } };
    } catch (error) {
      if (error?.message === 'Forbidden') return { status: 403, body: { error: 'Forbidden' } };
      return { status: 500, body: { error: 'Internal server error' } };
    }
  };
}
