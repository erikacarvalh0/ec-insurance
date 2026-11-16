import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Dashboard } from './Dashboard.mjs';

test('renders a React dashboard with accessible heading and lead counts', () => {
  const markup = renderToStaticMarkup(Dashboard({
    summary: { total: 2, received: 1, quoted: 1, manualReview: 0 },
  }));

  assert.match(markup, /<main/);
  assert.match(markup, /Insurance dashboard/);
  assert.match(markup, /Total leads: 2/);
});

test('renders a safe empty state', () => {
  const markup = renderToStaticMarkup(Dashboard({
    summary: { total: 0, received: 0, quoted: 0, manualReview: 0 },
  }));

  assert.match(markup, /No leads found/);
});
