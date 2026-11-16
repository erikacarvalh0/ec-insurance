import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navigation } from './Navigation.mjs';

test('provides public insurance and private broker navigation', () => {
  const html = renderToStaticMarkup(createElement(Navigation, { view: 'public' }));
  assert.match(html, /Insurance quotation/);
  assert.match(html, /Broker dashboard/);
  assert.match(html, /aria-current="page"/);
});

test('broker view marks dashboard as active', () => {
  const html = renderToStaticMarkup(createElement(Navigation, { view: 'broker' }));
  assert.match(html, /aria-current="page"/);
  assert.match(html, /Broker dashboard/);
});
