// Scope lead queries by the authenticated actor; never expose contact details.
const STATUS_FILTERS = new Set(['received','processing','quoted','manual_review','contacted','completed','cancelled']);
const TYPE_FILTERS = new Set(['auto','residential','life','health','business','travel']);

export function createPrismaLeadListRepository(prisma) {
  if (typeof prisma?.lead?.findMany !== 'function') {
    throw new TypeError('Prisma lead.findMany is required');
  }

  return {
    async list(actor, { limit = 100, offset = 0, status, insuranceType, search } = {}) {
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) {
        throw new RangeError('Invalid pagination');
      }
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

      if ((status !== undefined && !STATUS_FILTERS.has(status)) || (insuranceType !== undefined && !TYPE_FILTERS.has(insuranceType))) throw new TypeError('Invalid filters');
      if (search !== undefined && (typeof search !== 'string' || !/^[A-Za-z0-9_-]{2,64}$/.test(search))) throw new TypeError('Invalid search');
      where = { ...where, ...(status ? { status: status.toUpperCase() } : {}), ...(insuranceType ? { insuranceType: insuranceType.toUpperCase() } : {}), ...(search ? { id: { startsWith: search } } : {}) };

      const records = await prisma.lead.findMany({
        where,
        select: { id: true, insuranceType: true, status: true, createdAt: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit,
        skip: offset,
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
