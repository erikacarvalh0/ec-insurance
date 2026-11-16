import { parseJsonBody } from './json-body.mjs';

export function createHttpLoginHandler({ login }) {
  if (typeof login !== 'function') throw new TypeError('Login handler is required');

  return async function handleHttpLogin(request) {
    if (request?.method !== 'POST') return login({ method: request?.method });
    if (!request.headers?.['content-type']?.toLowerCase().startsWith('application/json')) {
      return { status: 415, body: { error: 'JSON content type required' } };
    }

    let body;
    try {
      body = await parseJsonBody(request, { maxBytes: 4096 });
    } catch (error) {
      if (error instanceof RangeError) return { status: 413, body: { error: 'Payload too large' } };
      return { status: 400, body: { error: 'Invalid JSON request' } };
    }

    return login({ method: request.method, body });
  };
}
