import { randomUUID } from 'node:crypto';

export function createRequestLogger({ write = (line) => process.stdout.write(line + '\n'), now = () => Date.now() } = {}) {
  if (typeof write !== 'function' || typeof now !== 'function') throw new TypeError('Logger requires functions');
  return function log({ id, method, url, status, durationMs }) {
    const pathname = typeof url === 'string' ? url.split(/[?#]/, 1)[0] : '/';
    const fixed = new Set(['/health', '/api/intake', '/api/login', '/api/leads']);
    const leadRoute = /^\/api\/leads\/[^/]+(?:\/(status|status-history|assignment))?$/.exec(pathname);
    const path = fixed.has(pathname) ? pathname : leadRoute ? '/api/leads/:id' + (leadRoute[1] ? '/' + leadRoute[1] : '') : '/unknown';
    write(JSON.stringify({ event: 'http_request', requestId: id, method, path, status, durationMs }));
  };
}

export function attachRequestCorrelation(request, response, { log = createRequestLogger(), now = () => Date.now() } = {}) {
  const id = randomUUID();
  const start = now();
  response.setHeader('X-Request-ID', id);
  if (typeof response.once === 'function') {
    response.once('finish', () => log({ id, method: request.method, url: request.url, status: response.statusCode, durationMs: Math.max(0, now() - start) }));
  }
  return id;
}
