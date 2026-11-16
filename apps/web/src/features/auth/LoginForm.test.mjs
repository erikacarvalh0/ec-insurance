import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoginForm } from './LoginForm.mjs';

test('login form exposes labeled email and password fields', () => {
  const html = renderToStaticMarkup(createElement(LoginForm, { onSubmit: () => {} }));
  assert.match(html, /type="email"/);
  assert.match(html, /type="password"/);
  assert.match(html, /autoComplete="current-password"/);
  assert.match(html, /Sign in/);
});

test('login form supports error and loading feedback', () => {
  const html = renderToStaticMarkup(createElement(LoginForm, { error: 'Invalid credentials', submitting: true }));
  assert.match(html, /role="alert"/);
  assert.match(html, /disabled=""/);
});
