import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App.mjs';

test('broker route renders a login form before authentication', () => {
  const html = renderToStaticMarkup(createElement(App, { pathname: '/broker' }));
  assert.match(html, /Broker sign in/);
  assert.match(html, /type="password"/);
});

test('broker route renders dashboard with an existing session', () => {
  const html = renderToStaticMarkup(createElement(App, { pathname: '/broker', token: Buffer.from(JSON.stringify({ exp: 4_102_444_800 })).toString('base64url') + '.signature' }));
  assert.match(html, /Broker dashboard/);
  assert.doesNotMatch(html, /Broker sign in/);
});
