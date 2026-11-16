import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('API entrypoint listens using a configurable port and loopback default', () => {
  const source = readFileSync(new URL('./start.mjs', import.meta.url), 'utf8');
  assert.match(source, /createApiServer/);
  assert.match(source, /PORT/);
  assert.match(source, /127\.0\.0\.1/);
});

test('root package exposes a runnable API start command', () => {
  const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts['start:api'], 'node packages/api/src/start.mjs');
});
