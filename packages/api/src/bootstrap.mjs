import { createPrismaLeadRepository } from '../../leads/src/repository.mjs';
import { checkDatabaseConnection } from '../../leads/src/database.mjs';
import { createPersistentApiServer } from './persistent-server.mjs';

export function createPrismaApiRuntime({ prisma }) {
  if (typeof prisma?.$disconnect !== 'function') {
    throw new TypeError('Prisma client must support disconnection');
  }

  const server = createPersistentApiServer({
    leadRepository: createPrismaLeadRepository(prisma),
    checkDatabase: () => checkDatabaseConnection(prisma),
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
