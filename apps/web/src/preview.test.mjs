import assert from 'node:assert/strict';
import test from 'node:test';

import { createPreviewServer } from './preview.mjs';

test('serves the insurance intake preview as HTML', async (t) => {
  const server = createPreviewServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(html, /Request insurance quotation/);
  assert.match(html, /name="vehicleModel"/);
});

test('does not serve unknown routes', async (t) => {
  const server = createPreviewServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/missing`);
  assert.equal(response.status, 404);
});
