import test from 'node:test';
import assert from 'node:assert/strict';
import { createRevocationRepository } from './revocation-repository.mjs';

test('revokes idempotently and checks persisted revocation', async () => {
  const rows = new Map();
  const repository = createRevocationRepository({ revokedSession: {
    upsert: async ({where,create}) => { if (!rows.has(where.id)) rows.set(where.id,create); },
    findUnique: async ({where}) => rows.get(where.id) ?? null,
  }});
  assert.equal(await repository.isRevoked('session-1'),false);
  await repository.revoke({sessionId:'session-1',expiresAt:200});
  await repository.revoke({sessionId:'session-1',expiresAt:200});
  assert.equal(await repository.isRevoked('session-1'),true);
  assert.equal(rows.size,1);
});
