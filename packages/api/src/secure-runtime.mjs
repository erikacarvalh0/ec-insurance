import { createPrismaLeadRepository } from '../../leads/src/repository.mjs';
import { createPrismaLeadListRepository } from '../../leads/src/list-repository.mjs';
import { checkDatabaseConnection } from '../../leads/src/database.mjs';
import { createSecureApiServer } from './secure-server.mjs';

export function createPrismaSecureRuntime({ prisma, verifyToken, login }) {
  if (typeof prisma?.$disconnect !== 'function') {
    throw new TypeError('Prisma client must support disconnection');
  }

  const server = createSecureApiServer({
    leadRepository: createPrismaLeadRepository(prisma),
    leadListRepository: createPrismaLeadListRepository(prisma),
    checkDatabase: () => checkDatabaseConnection(prisma),
    verifyToken,
    login,
  });

  return {
    server,
    async close() {
      if (server.listening) {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      }
      await prisma.$disconnect();
    },
  };
}
