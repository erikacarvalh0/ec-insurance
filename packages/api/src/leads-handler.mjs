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
      actor = await verifyToken(match[1]);
    } catch {
      return { status: 401, body: { error: 'Unauthorized' } };
    }
    if (!actor) return { status: 401, body: { error: 'Unauthorized' } };

    let pagination;
    try {
      const query = new URL(request.url ?? '/api/leads', 'http://localhost').searchParams;
      if ([...query.keys()].some(key => !['search','status','insuranceType','limit','offset','ownerId','from','to'].includes(key))) return { status: 400, body: { error: 'Unknown query parameter' } };
      const limit = query.has('limit') ? Number(query.get('limit')) : 100;
      const offset = query.has('offset') ? Number(query.get('offset')) : 0;
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) {
        return { status: 400, body: { error: 'Invalid pagination' } };
      }
      if (['search','status','insuranceType','limit','offset','ownerId','from','to'].some(key => query.getAll(key).length > 1)) return { status: 400, body: { error: 'Repeated query parameter' } };
      const search = query.get('search') ?? undefined;
      if (search !== undefined && !/^[A-Za-z0-9_-]{2,64}$/.test(search)) return { status: 400, body: { error: 'Invalid search' } };
      const status = query.get('status') ?? undefined;
      const insuranceType = query.get('insuranceType') ?? undefined;
      if ((status !== undefined && !STATUS_FILTERS.has(status)) || (insuranceType !== undefined && !TYPE_FILTERS.has(insuranceType))) return { status: 400, body: { error: 'Invalid filters' } };
      const ownerId = query.get('ownerId') ?? undefined;
      const from = query.get('from') ?? undefined;
      const to = query.get('to') ?? undefined;
      const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
      if ((ownerId !== undefined && !/^[A-Za-z0-9_-]{1,64}$/.test(ownerId)) || (from !== undefined && !valid(from)) || (to !== undefined && !valid(to)) || (from && to && from >= to)) return {status:400,body:{error:'Invalid filters'}};
      pagination = { limit, offset, ...(ownerId ? {ownerId} : {}), ...(from ? {from} : {}), ...(to ? {to} : {}), ...(status ? { status } : {}), ...(insuranceType ? { insuranceType } : {}), ...(search ? { search } : {}) };
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
