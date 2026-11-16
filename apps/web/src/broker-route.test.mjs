import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App.mjs';

test('broker URL renders dashboard and marks broker navigation active', () => {
  const html = renderToStaticMarkup(createElement(App, { pathname: '/broker' }));
  assert.match(html, /Broker dashboard/);
  assert.match(html, /Sign in to view your leads/);
  assert.match(html, /href="\/broker" aria-current="page"/);
  assert.doesNotMatch(html, /Request insurance quotation/);
});

test('public URL still renders the insurance intake', () => {
  const html = renderToStaticMarkup(createElement(App, { pathname: '/' }));
  assert.match(html, /Request insurance quotation/);
});
