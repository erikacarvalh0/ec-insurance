const STATUS_FILTERS = new Set(['received','processing','quoted','manual_review','contacted','completed','cancelled']);
const TYPE_FILTERS = new Set(['auto','residential','life','health','business','travel']);

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
      if (['search','status','insuranceType','limit','offset'].some(key => query.getAll(key).length > 1)) return { status: 400, body: { error: 'Repeated query parameter' } };
      const search = query.get('search') ?? undefined;
      if (search !== undefined && !/^[A-Za-z0-9_-]{2,64}$/.test(search)) return { status: 400, body: { error: 'Invalid search' } };
      const status = query.get('status') ?? undefined;
      const insuranceType = query.get('insuranceType') ?? undefined;
      if ((status !== undefined && !STATUS_FILTERS.has(status)) || (insuranceType !== undefined && !TYPE_FILTERS.has(insuranceType))) return { status: 400, body: { error: 'Invalid filters' } };
      pagination = { limit, offset, ...(status ? { status } : {}), ...(insuranceType ? { insuranceType } : {}), ...(search ? { search } : {}) };
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
