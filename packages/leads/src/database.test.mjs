import assert from 'node:assert/strict';
import test from 'node:test';

import { createDatabaseClient, checkDatabaseConnection } from './database.mjs';

test('creates an injectable database client without connecting immediately', () => {
  let constructed = 0;
  class FakePrismaClient {
    constructor() { constructed += 1; }
  }
  const client = createDatabaseClient(FakePrismaClient);
  assert.ok(client instanceof FakePrismaClient);
  assert.equal(constructed, 1);
});

test('reports database availability via Prisma query', async () => {
  const statements = [];
  const available = await checkDatabaseConnection({
    $queryRawUnsafe: async (sql) => { statements.push(sql); return [{ '?column?': 1 }]; },
  });

  assert.equal(available, true);
  assert.deepEqual(statements, ['SELECT 1']);
});

test('returns false for database failures without leaking credentials', async () => {
  const available = await checkDatabaseConnection({
    $queryRawUnsafe: async () => { throw new Error('postgresql://private:secret@host'); },
  });
  assert.equal(available, false);
});
