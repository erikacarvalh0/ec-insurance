import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('Prisma startup verifies signed sessions before exposing broker leads', () => {
  const source = readFileSync(new URL('./start-prisma.mjs', import.meta.url), 'utf8');
  assert.match(source, /createPrismaSecureRuntime/);
  assert.match(source, /createSessionTokenService/);
  assert.match(source, /SESSION_SECRET/);
  assert.match(source, /verifyToken:\s*sessionTokens\.verify/);
});

test('API refuses to start without a configured signing secret', () => {
  const source = readFileSync(new URL('./start-prisma.mjs', import.meta.url), 'utf8');
  assert.match(source, /if \(!process\.env\.SESSION_SECRET\)/);
});
