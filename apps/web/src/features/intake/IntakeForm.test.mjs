import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { IntakeForm } from './IntakeForm.mjs';

test('renders accessible public intake fields', () => {
  const markup = renderToStaticMarkup(IntakeForm({ insuranceType: 'auto' }));
  assert.match(markup, /<form/);
  assert.match(markup, /name="name"/);
  assert.match(markup, /name="email"/);
  assert.match(markup, /name="phone"/);
  assert.match(markup, /name="insuranceType"/);
  assert.match(markup, /type="submit"/);
});

test('escapes user-controlled insurance type', () => {
  const markup = renderToStaticMarkup(IntakeForm({ insuranceType: '<script>bad()</script>' }));
  assert.doesNotMatch(markup, /<script>/);
});

test('provides a descriptive heading and required contact fields', () => {
  const markup = renderToStaticMarkup(IntakeForm({ insuranceType: 'travel' }));
  assert.match(markup, /Request insurance quotation/);
  assert.match(markup, /required=""/);
});
