export function createPrismaLeadStatusHistoryRepository(prisma) {
  if (typeof prisma?.lead?.findFirst !== 'function') {
    throw new TypeError('Prisma lead.findFirst is required');
  }

  return {
    async list(actor, id, { limit = 100, offset = 0 } = {}) {
      let scope;
      if (actor?.role === 'broker' && actor.userId) scope = { ownerId: actor.userId };
      else if (actor?.role === 'manager' && actor.teamId) scope = { teamId: actor.teamId };
      else if (actor?.role === 'admin' && actor.userId) scope = {};
      else throw new Error('Forbidden');

      if (typeof id !== 'string' || !id.trim() || id.length > 128) throw new TypeError('Invalid lead ID');
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) {
        throw new RangeError('Invalid pagination');
      }

      const lead = await prisma.lead.findFirst({
        where: { id, ...scope },
        select: {
          statusHistory: {
            select: { id: true, leadId: true, actorId: true, fromStatus: true, toStatus: true, createdAt: true },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit,
            skip: offset,
          },
        },
      });

      return lead ? lead.statusHistory.map((entry) => ({
        id: entry.id,
        leadId: entry.leadId,
        actorId: entry.actorId,
        fromStatus: entry.fromStatus.toLowerCase(),
        toStatus: entry.toStatus.toLowerCase(),
        createdAt: entry.createdAt,
      })) : null;
    },
  };
}
