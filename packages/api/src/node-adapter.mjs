export function createNodeHttpAdapter(handler) {
  if (typeof handler !== 'function') {
    throw new TypeError('A request handler is required');
  }

  return async function handleNodeRequest(request, response) {
    try {
      const result = await handler(request);

      response.statusCode = result.status;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');

      for (const [name, value] of Object.entries(result.headers ?? {})) {
        response.setHeader(name, value);
      }

      response.end(JSON.stringify(result.body ?? {}));
    } catch {
      response.statusCode = 500;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: 'Internal server error' }));
    }
  };
}
