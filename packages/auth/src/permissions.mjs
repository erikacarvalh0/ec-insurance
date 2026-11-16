const ALLOWED_ROLES = new Set(['admin', 'manager', 'broker']);

export function canAccessLead(principal, lead) {
  if (!principal || !lead || !ALLOWED_ROLES.has(principal.role)) {
    return false;
  }

  if (principal.role === 'admin') {
    return true;
  }

  return Boolean(
    principal.teamId &&
    lead.teamId &&
    principal.teamId === lead.teamId,
  );
}
