export function createApiRouter({ intake, health }) {
  if (typeof intake !== 'function' || typeof health !== 'function') {
    throw new TypeError('Both intake and health handlers are required');
  }

  return async function route(request) {
    const pathname = (request?.url ?? '').split('?')[0];

    if (pathname === '/api/intake') {
      return intake(request);
    }

    if (pathname === '/health') {
      return health(request);
    }

    return { status: 404, body: { error: 'Not found' } };
  };
}
