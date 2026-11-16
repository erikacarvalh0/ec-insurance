const ALLOWED_ROLES = new Set(['broker', 'manager', 'admin']);

export function validateSession(session, now) {
  if (
    !session?.userId ||
    !ALLOWED_ROLES.has(session.role) ||
    typeof session.expiresAt !== 'string'
  ) {
    return false;
  }

  const expiresAt = Date.parse(session.expiresAt);
  const currentTime = Date.parse(now);

  return Number.isFinite(expiresAt) &&
    Number.isFinite(currentTime) &&
    expiresAt > currentTime;
}
