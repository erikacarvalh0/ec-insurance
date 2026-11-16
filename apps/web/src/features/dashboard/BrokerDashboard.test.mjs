import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrokerDashboard } from './BrokerDashboard.mjs';

test('renders broker dashboard with session-required status', () => {
  const html = renderToStaticMarkup(createElement(BrokerDashboard));
  assert.match(html, /Broker dashboard/);
  assert.match(html, /Sign in/);
});

test('never embeds a session token in server-rendered HTML', () => {
  const html = renderToStaticMarkup(createElement(BrokerDashboard, { token: 'secret-token' }));
  assert.doesNotMatch(html, /secret-token/);
});
