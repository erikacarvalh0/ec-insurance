export function createPrismaUserRepository(prisma) {
  if (typeof prisma?.user?.findUnique !== 'function') {
    throw new TypeError('Prisma user model with findUnique is required');
  }
  return {
    async findByEmail(email) {
      if (typeof email !== 'string' || !email.trim()) return null;
      return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    },
  };
}
