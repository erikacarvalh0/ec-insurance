import { createServer } from 'node:http';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { IntakeForm } from './features/intake/IntakeForm.mjs';

export function createPreviewServer() {
  return createServer((request, response) => {
    if (request.method !== 'GET' || request.url !== '/') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const markup = renderToStaticMarkup(h(IntakeForm, { insuranceType: 'auto' }));
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'self'; base-uri 'none'; form-action 'self'",
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Insurance intake preview</title></head><body>${markup}</body></html>`);
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const port = Number(process.env.WEB_PORT ?? 3000);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new RangeError('WEB_PORT must be between 1 and 65535');
  }
  createPreviewServer().listen(port, '127.0.0.1', () => {
    console.info(`Insurance HTML preview at http://127.0.0.1:${port}`);
  });
}
