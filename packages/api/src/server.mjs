import { createServer } from 'node:http';

import { createLeadStore } from '../../leads/src/leads.mjs';
import { createInsuranceIntakeWorkflow } from '../../quotation/src/intake-workflow.mjs';
import { createMockQuotationProvider } from '../../quotation/src/provider.mjs';
import { createIntakeHandler } from './intake-handler.mjs';
import { createNodeHttpAdapter } from './node-adapter.mjs';

async function readJson(request, maxBytes = 64 * 1024) {
  let bytes = 0;
  const chunks = [];

  for await (const chunk of request) {
    bytes += chunk.length;

    if (bytes > maxBytes) {
      throw new RangeError('Payload too large');
    }

    chunks.push(chunk);
  }

  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new TypeError('Expected a JSON object');
  }

  return body;
}

export function createApiServer() {
  const workflow = createInsuranceIntakeWorkflow({
    leadStore: createLeadStore(),
    provider: createMockQuotationProvider(),
  });
  const intake = createIntakeHandler(workflow);

  return createServer(createNodeHttpAdapter(async (request) => {
    const pathname = (request.url ?? '').split('?')[0];

    if (pathname === '/health') {
      return request.method === 'GET'
        ? { status: 200, body: { status: 'ok' } }
        : { status: 405, headers: { Allow: 'GET' }, body: { error: 'Method not allowed' } };
    }

    if (pathname !== '/api/intake') {
      return { status: 404, body: { error: 'Not found' } };
    }

    if (request.method !== 'POST') {
      return intake({ method: request.method });
    }

    if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
      return { status: 415, body: { error: 'JSON content type required' } };
    }

    let body;

    try {
      body = await readJson(request);
    } catch (error) {
      return {
        status: error instanceof RangeError ? 413 : 400,
        body: { error: error instanceof RangeError ? 'Payload too large' : 'Invalid JSON request' },
      };
    }

    return intake({ method: 'POST', body });
  }));
}
