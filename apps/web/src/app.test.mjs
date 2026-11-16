import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { App } from './App.mjs';

test('renders an interactive insurance intake application shell', () => {
  const html = renderToStaticMarkup(createElement(App));
  assert.match(html, /Request insurance quotation/);
  assert.match(html, /name="insuranceType"/);
  assert.match(html, /role="status"/);
});

test('Vite HTML entrypoint mounts the React application', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="root"/);
  assert.match(html, /src="\/src\/main\.mjs"/);
});
