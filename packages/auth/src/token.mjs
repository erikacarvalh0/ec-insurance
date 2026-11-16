import { createHmac, timingSafeEqual } from 'node:crypto';

const ROLES = new Set(['broker', 'manager', 'admin']);

export function createSessionTokenService({ secret, now = Date.now, ttlSeconds = 3600 }) {
  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new TypeError('Session secret must contain at least 32 bytes');
  }
  if (typeof now !== 'function' || !Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1) {
    throw new TypeError('Invalid session clock or lifetime');
  }

  const sign = (payload) => createHmac('sha256', secret).update(payload).digest('base64url');

  return {
    issue(actor) {
      if (typeof actor?.userId !== 'string' || !actor.userId || !ROLES.has(actor.role)) {
        throw new TypeError('A valid session actor is required');
      }
      if (actor.teamId !== undefined && (typeof actor.teamId !== 'string' || !actor.teamId)) {
        throw new TypeError('Session teamId must be a non-empty string');
      }
      const issuedAt = Math.floor(now() / 1000);
      const expiresAt = issuedAt + ttlSeconds;
      if (!Number.isSafeInteger(issuedAt) || !Number.isSafeInteger(expiresAt)) {
        throw new TypeError('Session timestamps must be safe integers');
      }
      const payload = Buffer.from(JSON.stringify({
        sub: actor.userId, role: actor.role,
        ...(actor.teamId ? { teamId: actor.teamId } : {}),
        iat: issuedAt, exp: expiresAt,
      })).toString('base64url');
      return `${payload}.${sign(payload)}`;
    },
    verify(token) {
      if (typeof token !== 'string') return null;
      const parts = token.split('.');
      if (parts.length !== 2 || !parts.every(Boolean)) return null;
      const [payload, signature] = parts;
      if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]+$/.test(signature)) return null;
      const expected = Buffer.from(sign(payload));
      const actual = Buffer.from(signature);
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
      try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        const current = Math.floor(now() / 1000);
        if (!Number.isSafeInteger(current) ||
            !Number.isSafeInteger(data.iat) || !Number.isSafeInteger(data.exp) ||
            data.iat > current || data.exp <= current ||
            typeof data.sub !== 'string' || !data.sub || !ROLES.has(data.role)) return null;
        if (data.teamId !== undefined && (typeof data.teamId !== 'string' || !data.teamId)) return null;
        return { userId: data.sub, role: data.role, ...(data.teamId ? { teamId: data.teamId } : {}) };
      } catch {
        return null;
      }
    },
  };
}
