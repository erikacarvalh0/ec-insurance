import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { InteractiveIntakeForm } from './InteractiveIntakeForm.mjs';

test('renders an accessible form with submission status region', () => {
  const markup = renderToStaticMarkup(createElement(InteractiveIntakeForm, {
    insuranceType: 'auto',
    submit: async () => ({ success: true }),
    createKey: () => 'req-1',
  }));
  assert.match(markup, /<form/);
  assert.match(markup, /role="status"/);
  assert.match(markup, /name="vehicleModel"/);
  assert.match(markup, /name="vehicleYear"/);
});

test('does not expose unsafe values in rendered markup', () => {
  const markup = renderToStaticMarkup(createElement(InteractiveIntakeForm, {
    insuranceType: '<script>bad()</script>',
    submit: async () => ({}),
  }));
  assert.doesNotMatch(markup, /<script>/);
});
