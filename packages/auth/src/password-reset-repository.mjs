export function createPrismaPasswordResetRepository(prisma) {
  if (typeof prisma?.user?.updateMany !== 'function') {
    throw new TypeError('Prisma user model with updateMany is required');
  }
  return {
    async replace({ email, tokenHash, expiresAt }) {
      const result = await prisma.user.updateMany({
        where: { email, active: true },
        data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt },
      });
      return result.count === 1;
    },
    async consume({ tokenHash, passwordHash, now }) {
      // One conditional write consumes the token and changes the password together.
      const result = await prisma.user.updateMany({
        where: {
          active: true,
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: { gt: now },
        },
        data: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null },
      });
      return result.count === 1;
    },
  };
}
