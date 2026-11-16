export function createLeadStatusAuditEntry({ leadId, actorId, from, to, at = new Date() } = {}) {
  if (![leadId, actorId, from, to].every((value) => typeof value === 'string' && value.trim()) || from === to || !(at instanceof Date) || Number.isNaN(at.getTime())) {
    throw new TypeError('Invalid audit entry');
  }
  return { leadId, actorId, fromStatus: from, toStatus: to, createdAt: at };
}
