export function createProtectedLeadsHandler({ verifyToken, leadListRepository }) {
  if (typeof verifyToken !== 'function' || typeof leadListRepository?.list !== 'function') {
    throw new TypeError('Session verifier and lead repository are required');
  }

  return async function handleLeads(request) {
    if (request?.method !== 'GET') {
      return { status: 405, headers: { Allow: 'GET' }, body: { error: 'Method not allowed' } };
    }

    const authorization = request?.headers?.authorization ?? request?.headers?.Authorization;
    const match = typeof authorization === 'string' && /^Bearer ([A-Za-z0-9._~-]+)$/.exec(authorization);
    if (!match) return { status: 401, body: { error: 'Unauthorized' } };

    let actor;
    try {
      actor = verifyToken(match[1]);
    } catch {
      return { status: 401, body: { error: 'Unauthorized' } };
    }
    if (!actor) return { status: 401, body: { error: 'Unauthorized' } };

    let pagination;
    try {
      const query = new URL(request.url ?? '/api/leads', 'http://localhost').searchParams;
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
      const leads = await leadListRepository.list(actor, pagination);
      return { status: 200, headers: { 'Cache-Control': 'no-store' }, body: { leads } };
    } catch (error) {
      if (error?.message === 'Forbidden') return { status: 403, body: { error: 'Forbidden' } };
      return { status: 500, body: { error: 'Internal server error' } };
    }
  };
}
