export function createPrismaLeadDetailRepository(prisma) {
  if (typeof prisma?.lead?.findFirst !== 'function') throw new TypeError('Prisma lead.findFirst is required');
  return {
    async findById(actor, id) {
      let scope;
      if (actor?.role === 'broker' && actor.userId) scope = { ownerId: actor.userId };
      else if (actor?.role === 'manager' && actor.teamId) scope = { teamId: actor.teamId };
      else if (actor?.role === 'admin' && actor.userId) scope = {};
      else throw new Error('Forbidden');
      if (typeof id !== 'string' || !id.trim() || id.length > 128) throw new TypeError('Invalid lead ID');
      const record = await prisma.lead.findFirst({
        where: { id, ...scope },
        select: { id: true, insuranceType: true, status: true, createdAt: true, updatedAt: true },
      });
      return record ? { id: record.id, insuranceType: record.insuranceType.toLowerCase(), status: record.status.toLowerCase(), createdAt: record.createdAt, updatedAt: record.updatedAt } : null;
    },
  };
}
