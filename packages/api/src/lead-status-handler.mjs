import { parseJsonBody } from './json-body.mjs';

export function createProtectedLeadStatusHandler({ verifyToken, leadStatusRepository }) {
  if (typeof verifyToken !== 'function' || typeof leadStatusRepository?.updateStatus !== 'function') {
    throw new TypeError('Verifier and lead status repository are required');
  }
  return async function handleLeadStatus(request) {
    if (request?.method !== 'PATCH') return { status: 405, headers: { Allow: 'PATCH' }, body: { error: 'Method not allowed' } };
    const auth = request.headers?.authorization ?? request.headers?.Authorization;
    const match = typeof auth === 'string' && /^Bearer ([A-Za-z0-9._~-]+)$/.exec(auth);
    let actor;
    try { actor = match && await verifyToken(match[1]); } catch { /* Invalid token. */ }
    if (!actor) return { status: 401, body: { error: 'Unauthorized' } };
    const path = /^\/api\/leads\/([A-Za-z0-9_-]{1,128})\/status$/.exec((request.url ?? '').split('?')[0]);
    if (!path) return { status: 404, body: { error: 'Not found' } };
    if (!request.headers?.['content-type']?.toLowerCase().startsWith('application/json')) {
      return { status: 415, body: { error: 'JSON content type required' } };
    }
    let body;
    try { body = await parseJsonBody(request, { maxBytes: 4096 }); } catch (error) {
      return { status: error instanceof RangeError ? 413 : 400, body: { error: 'Invalid JSON request' } };
    }
    if (typeof body.status !== 'string' || !/^[A-Za-z_]{1,32}$/.test(body.status) || Object.keys(body).some((key) => key !== 'status')) {
      return { status: 400, body: { error: 'Invalid status request' } };
    }
    try {
      const lead = await leadStatusRepository.updateStatus(actor, path[1], body.status);
      return lead ? { status: 200, headers: { 'Cache-Control': 'no-store' }, body: { lead } } : { status: 404, body: { error: 'Not found' } };
    } catch (error) {
      if (error?.message === 'Forbidden') return { status: 403, body: { error: 'Forbidden' } };
      if (['Invalid status transition', 'Lead changed concurrently'].includes(error?.message)) return { status: 409, body: { error: error.message } };
      return { status: 500, body: { error: 'Internal server error' } };
    }
  };
}
