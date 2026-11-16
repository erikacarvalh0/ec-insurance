export function createCredentialVerifier({ users, verifyPassword }) {
  if (typeof users?.findByEmail !== 'function' || typeof verifyPassword !== 'function') {
    throw new TypeError('User repository and password verifier are required');
  }
  return async function verifyCredentials({ email, password }) {
    if (typeof email !== 'string' || typeof password !== 'string') return null;
    const user = await users.findByEmail(email);
    if (!user?.active || !user.id || !['BROKER', 'MANAGER', 'ADMIN'].includes(user.role)) return null;
    if (!await verifyPassword(password, user.passwordHash)) return null;
    return { userId: user.id, role: user.role.toLowerCase(), ...(user.teamId ? { teamId: user.teamId } : {}) };
  };
}
