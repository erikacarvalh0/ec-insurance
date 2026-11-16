import { createServer } from 'node:http';

import { createNodeHttpAdapter } from './node-adapter.mjs';
import { createPersistentIntakeHandler } from './persistent-intake.mjs';
import { createHealthHandler } from './health.mjs';
import { createApiRouter } from './router.mjs';

export function createPersistentApiServer({ leadRepository, checkDatabase }) {
  const route = createApiRouter({
    intake: createPersistentIntakeHandler({ leadRepository }),
    health: createHealthHandler({ checkDatabase }),
  });

  return createServer(createNodeHttpAdapter(async (request) => {
    const pathname = (request.url ?? '').split('?')[0];

    if (pathname !== '/api/intake' || request.method !== 'POST') {
      return route(request);
    }

    if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
      return { status: 415, body: { error: 'JSON content type required' } };
    }

    let body;

    try {
      let size = 0;
      const chunks = [];

      for await (const chunk of request) {
        size += chunk.length;

        if (size > 64 * 1024) {
          return { status: 413, body: { error: 'Payload too large' } };
        }

        chunks.push(chunk);
      }

      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return { status: 400, body: { error: 'Invalid JSON request' } };
    }

    return route({ method: request.method, url: request.url, body });
  }));
}
