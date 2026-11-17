import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRevocationRepository } from './revocation-repository.mjs';
import { createSessionTokenService } from './token.mjs';

test('PostgreSQL persists revocation across repository instances', {skip: !process.env.TEST_DATABASE_URL}, async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient({datasources:{db:{url:process.env.TEST_DATABASE_URL}}});
  const tokens = createSessionTokenService({secret:randomUUID()});
  const actor={userId:randomUUID(),role:'broker'};
  const token=tokens.issue(actor);
  const session=tokens.verifySession(token);
  try {
    const repository=createRevocationRepository(prisma);
    assert.equal(await repository.isRevoked(session.sessionId),false);
    await repository.revoke({sessionId:session.sessionId,expiresAt:session.expiresAt});
    await repository.revoke({sessionId:session.sessionId,expiresAt:session.expiresAt});
    assert.equal(await createRevocationRepository(prisma).isRevoked(session.sessionId),true);
  } finally {
    try {await prisma.revokedSession.deleteMany({where:{id:session.sessionId}});}
    finally {await prisma.$disconnect();}
  }
});
