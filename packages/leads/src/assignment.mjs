export function assignLead({ actor, lead, broker }) {
  if (!broker?.active) {
    throw new Error('Cannot assign an inactive broker');
  }

  const isAdmin = actor?.role === 'admin';
  const isTeamManager = (
    actor?.role === 'manager' &&
    Boolean(actor.teamId) &&
    actor.teamId === lead?.teamId
  );
  const sameTeam = Boolean(lead?.teamId) && lead.teamId === broker?.teamId;

  if ((!isAdmin && !isTeamManager) || !sameTeam) {
    throw new Error('Assignment not permitted');
  }

  return { ...lead, ownerId: broker.id };
}
