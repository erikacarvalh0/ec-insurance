import { createPrismaLeadAssignmentRepository } from '../../leads/src/assignment-repository.mjs';
import { createPrismaLeadStatusHistoryRepository } from '../../leads/src/status-history-repository.mjs';
import { createPrismaLeadRepository } from '../../leads/src/repository.mjs';
import { createPrismaLeadListRepository } from '../../leads/src/list-repository.mjs';
import { createPrismaLeadDetailRepository } from '../../leads/src/detail-repository.mjs';
import { createPrismaLeadStatusRepository } from '../../leads/src/status-repository.mjs';
import { checkDatabaseConnection } from '../../leads/src/database.mjs';
import { createSecureApiServer } from './secure-server.mjs';

export function createPrismaSecureRuntime({ prisma, verifyToken, login, loginLimiter }) {
  if (typeof prisma?.$disconnect !== 'function') {
    throw new TypeError('Prisma client must support disconnection');
  }

  const server = createSecureApiServer({
    leadRepository: createPrismaLeadRepository(prisma),
    leadListRepository: createPrismaLeadListRepository(prisma),
    leadDetailRepository: createPrismaLeadDetailRepository(prisma),
    leadStatusRepository: createPrismaLeadStatusRepository(prisma),
    leadAssignmentRepository: createPrismaLeadAssignmentRepository(prisma),
    leadStatusHistoryRepository: createPrismaLeadStatusHistoryRepository(prisma),
    checkDatabase: () => checkDatabaseConnection(prisma),
    verifyToken,
    login,
    loginLimiter,
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
