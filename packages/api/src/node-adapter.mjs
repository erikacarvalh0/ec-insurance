import { randomUUID } from 'node:crypto';

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export function createNodeHttpAdapter(handler, { logger = console } = {}) {
  if (typeof handler !== 'function') {
    throw new TypeError('A request handler is required');
  }

  return async function handleNodeRequest(request, response) {
    const upstreamId = response.getHeader?.('X-Request-ID');
    const alreadyCorrelated = typeof upstreamId === 'string' && upstreamId.length > 0;
    const incomingId = request.headers?.['x-request-id'];
    const requestId = alreadyCorrelated ? upstreamId : typeof incomingId === 'string' && REQUEST_ID_PATTERN.test(incomingId)
      ? incomingId
      : randomUUID();
    const started = performance.now();
    if (!alreadyCorrelated) response.setHeader('X-Request-Id', requestId);

    try {
      const result = await handler(request);
      response.statusCode = result.status;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');

      for (const [name, value] of Object.entries(result.headers ?? {})) {
        if (name.toLowerCase() !== 'x-request-id') {
          response.setHeader(name, value);
        }
      }

      response.end(JSON.stringify(result.body ?? {}));
    } catch {
      response.statusCode = 500;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: 'Internal server error' }));
    } finally {
      // Log only fixed metadata: never log URLs, query strings, headers, bodies or PII.
      if (!alreadyCorrelated) logger.info(JSON.stringify({
        event: 'http_request',
        requestId,
        method: request.method ?? 'UNKNOWN',
        status: response.statusCode,
        durationMs: Math.round(performance.now() - started),
      }));
    }
  };
}
