export function createProtectedLeadStatusHistoryHandler({ verifyToken, leadStatusHistoryRepository }) {
  if (typeof verifyToken !== 'function' || typeof leadStatusHistoryRepository?.list !== 'function') throw new TypeError('Verifier and lead status history repository are required');
  return async function handleLeadStatusHistory(request) {
    if (request?.method !== 'GET') return { status: 405, headers: { Allow: 'GET' }, body: { error: 'Method not allowed' } };
    const auth = request?.headers?.authorization ?? request?.headers?.Authorization;
    const match = typeof auth === 'string' && /^Bearer ([A-Za-z0-9._~-]+)$/.exec(auth);
    if (!match) return { status: 401, body: { error: 'Unauthorized' } };
    let actor;
    try { actor = verifyToken(match[1]); } catch { return { status: 401, body: { error: 'Unauthorized' } }; }
    if (!actor) return { status: 401, body: { error: 'Unauthorized' } };
    const path = (request.url ?? '').split('?')[0];
    const matchPath = /^\/api\/leads\/([A-Za-z0-9_-]{1,128})\/status-history$/.exec(path);
    if (!matchPath) return { status: 404, body: { error: 'Not found' } };
    let pagination;
    try {
      const query = new URL(request.url, 'http://localhost').searchParams;
      const limit = query.has('limit') ? Number(query.get('limit')) : 100;
      const offset = query.has('offset') ? Number(query.get('offset')) : 0;
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) {
        return { status: 400, body: { error: 'Invalid pagination' } };
      }
      pagination = { limit, offset };
    } catch {
      return { status: 400, body: { error: 'Invalid pagination' } };
    }
    try {
      const history = await leadStatusHistoryRepository.list(actor, matchPath[1], pagination);
      return history ? { status: 200, headers: { 'Cache-Control': 'no-store' }, body: { history } } : { status: 404, body: { error: 'Not found' } };
    } catch (error) {
      if (error?.message === 'Forbidden') return { status: 403, body: { error: 'Forbidden' } };
      return { status: 500, body: { error: 'Internal server error' } };
    }
  };
}
