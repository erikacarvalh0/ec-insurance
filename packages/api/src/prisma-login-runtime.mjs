import { createLoginHandler } from '../../auth/src/login.mjs';
import { createPrismaUserRepository } from '../../auth/src/user-repository.mjs';
import { createCredentialVerifier } from '../../auth/src/credentials.mjs';
import { verifyPassword } from '../../auth/src/password.mjs';

export function createPrismaLogin({ prisma, issueToken }) {
  const users = createPrismaUserRepository(prisma);
  const verifyCredentials = createCredentialVerifier({ users, verifyPassword });
  return createLoginHandler({ verifyCredentials, issueToken });
}
