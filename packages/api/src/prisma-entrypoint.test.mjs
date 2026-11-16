import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('Prisma entrypoint instantiates generated Prisma client and starts persistent runtime', () => {
  const source = readFileSync(new URL('./start-prisma.mjs', import.meta.url), 'utf8');
  assert.match(source, /PrismaClient/);
  assert.match(source, /createPrismaSecureRuntime/);
  assert.match(source, /DATABASE_URL/);
  assert.match(source, /createPrismaLogin/);
  assert.match(source, /issueToken/);
});

test('package exposes Prisma migration and API start commands', () => {
  const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts['start:api:db'], /start-prisma\.mjs/);
  assert.match(pkg.scripts['db:migrate'], /prisma migrate deploy/);
  assert.ok(pkg.dependencies['@prisma/client']);
  assert.ok(pkg.devDependencies.prisma);
});
