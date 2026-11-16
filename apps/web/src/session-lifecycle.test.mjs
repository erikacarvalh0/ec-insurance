import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App.mjs';

test('expired broker token shows login rather than protected dashboard', () => {
  const payload = Buffer.from(JSON.stringify({ exp: 1 })).toString('base64url');
  const html = renderToStaticMarkup(createElement(App, { pathname: '/broker', token: payload + '.signature' }));
  assert.match(html, /Broker sign in/);
  assert.doesNotMatch(html, /Sign out/);
});

test('active broker token retains dashboard access', () => {
  const payload = Buffer.from(JSON.stringify({ exp: 4_102_444_800 })).toString('base64url');
  const html = renderToStaticMarkup(createElement(App, { pathname: '/broker', token: payload + '.signature' }));
  assert.match(html, /Sign out/);
});
