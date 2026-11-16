import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App.mjs';

test('signed-in broker can access sign-out control', () => {
  const html = renderToStaticMarkup(createElement(App, { pathname: '/broker', token: 'signed' }));
  assert.match(html, /Sign out/);
  assert.match(html, /type="button"/);
});

test('anonymous broker cannot access sign-out control', () => {
  const html = renderToStaticMarkup(createElement(App, { pathname: '/broker' }));
  assert.doesNotMatch(html, /Sign out/);
});
