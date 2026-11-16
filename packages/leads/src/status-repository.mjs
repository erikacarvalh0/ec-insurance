import { canTransitionLeadStatus } from './status-transitions.mjs';
import { createLeadStatusAuditEntry } from './status-audit.mjs';

export function createPrismaLeadStatusRepository(prisma) {
  return {
    async updateStatus(actor, id, status) {
      if (typeof actor?.userId !== 'string' || !actor.userId.trim()) throw new Error('Forbidden');
      let scope;
      if (actor.role === 'broker') scope = { ownerId: actor.userId };
      else if (actor.role === 'manager' && actor.teamId) scope = { teamId: actor.teamId };
      else if (actor.role === 'admin') scope = {};
      else throw new Error('Forbidden');
      if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id) || typeof status !== 'string') {
        throw new TypeError('Invalid status request');
      }

      return prisma.$transaction(async (tx) => {
        const where = { id, ...scope };
        const lead = await tx.lead.findFirst({ where, select: { status: true } });
        if (!lead) return null;
        const nextStatus = status.toUpperCase();
        if (!canTransitionLeadStatus(lead.status, nextStatus)) throw new Error('Invalid status transition');
        const updated = await tx.lead.updateMany({
          where: { ...where, status: lead.status },
          data: { status: nextStatus },
        });
        if (updated.count !== 1) throw new Error('Lead changed concurrently');
        await tx.leadStatusHistory.create({
          data: createLeadStatusAuditEntry({ leadId: id, actorId: actor.userId, from: lead.status, to: nextStatus }),
        });
        return { id, status: nextStatus.toLowerCase() };
      });
    },
  };
}
