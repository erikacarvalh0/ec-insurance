import { PrismaClient } from '@prisma/client';

import { createPrismaSecureRuntime } from './secure-runtime.mjs';
import { createSessionTokenService } from '../../auth/src/token.mjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const port = Number(process.env.PORT ?? '3001');
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
  throw new RangeError('PORT must be an integer between 1 and 65535');
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required');
}

const sessionTokens = createSessionTokenService({ secret: process.env.SESSION_SECRET });
const prisma = new PrismaClient();
const runtime = createPrismaSecureRuntime({ prisma, verifyToken: sessionTokens.verify });

const host = process.env.HOST ?? '127.0.0.1';
runtime.server.listen(port, host, () => {
  console.info(`Persistent insurance API listening on ${host}:${port}`);
});

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    await runtime.close();
    process.exitCode = 0;
  } catch {
    process.exitCode = 1;
  }
}
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
