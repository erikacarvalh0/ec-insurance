// Scope lead queries by the authenticated actor; never expose contact details.
export function createPrismaLeadListRepository(prisma) {
  if (typeof prisma?.lead?.findMany !== 'function') {
    throw new TypeError('Prisma lead.findMany is required');
  }

  return {
    async list(actor) {
      let where;

      if (actor?.role === 'broker' && actor.userId) {
        where = { ownerId: actor.userId };
      } else if (actor?.role === 'manager' && actor.teamId) {
        where = { teamId: actor.teamId };
      } else if (actor?.role === 'admin' && actor.userId) {
        where = {};
      } else {
        throw new Error('Forbidden');
      }

      const records = await prisma.lead.findMany({
        where,
        select: { id: true, insuranceType: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return records.map((record) => ({
        id: record.id,
        insuranceType: record.insuranceType.toLowerCase(),
        status: record.status.toLowerCase(),
        createdAt: record.createdAt,
      }));
    },
  };
}
