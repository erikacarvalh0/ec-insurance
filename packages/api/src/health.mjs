export function createHealthHandler({ checkDatabase }) {
  if (typeof checkDatabase !== 'function') {
    throw new TypeError('A database probe is required');
  }

  return async function handleHealth(request) {
    if (request?.method !== 'GET') {
      return {
        status: 405,
        headers: { Allow: 'GET' },
        body: { error: 'Method not allowed' },
      };
    }

    try {
      const healthy = await checkDatabase();

      if (!healthy) {
        return { status: 503, body: { status: 'unavailable' } };
      }

      return { status: 200, body: { status: 'ok' } };
    } catch {
      return { status: 503, body: { status: 'unavailable' } };
    }
  };
}
