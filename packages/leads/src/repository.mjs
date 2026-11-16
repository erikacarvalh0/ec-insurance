import { fromLeadRecord, toLeadCreateData } from './persistence.mjs';

export function createPrismaLeadRepository(prisma) {
  if (typeof prisma?.lead?.create !== 'function') {
    throw new TypeError('A Prisma client with lead.create is required');
  }

  return {
    async create(input) {
      const data = toLeadCreateData(input);
      const record = await prisma.lead.create({ data });
      return fromLeadRecord(record);
    },
  };
}
