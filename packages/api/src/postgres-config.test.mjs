import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('local PostgreSQL has a healthcheck and persistent volume', () => {
  const compose = readFileSync(new URL('../../../compose.yaml', import.meta.url), 'utf8');

  assert.match(compose, /postgres:/);
  assert.match(compose, /healthcheck:/);
  assert.match(compose, /pg_isready/);
  assert.match(compose, /postgres_data:/);
});

test('sample environment declares a local database URL without real secrets', () => {
  const example = readFileSync(new URL('../../../.env.example', import.meta.url), 'utf8');

  assert.match(example, /^DATABASE_URL=postgresql:\/\//m);
  assert.doesNotMatch(example, /production|supabase|neon\.tech/i);
});
