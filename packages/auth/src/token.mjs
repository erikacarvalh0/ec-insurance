import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ROLES = new Set(['broker', 'manager', 'admin']);
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

export function createSessionTokenService({ secret, now = Date.now }) {
  if (typeof secret !== 'string' || Buffer.byteLength(secret) < 32) {
    throw new TypeError('Signing secret must be at least 32 bytes');
  }

  function sign(payload) {
    return createHmac('sha256', secret).update(payload).digest('base64url');
  }

  return {
    issue(actor, ttlSeconds = 3600) {
      if (!actor?.userId || !ROLES.has(actor.role) || !Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1) {
        throw new TypeError('Invalid actor or session lifetime');
      }

      const session = {
        userId: actor.userId,
        role: actor.role,
        ...(actor.teamId ? { teamId: actor.teamId } : {}),
        expiresAt: new Date(now() + ttlSeconds * 1000).toISOString(),
        nonce: randomBytes(16).toString('base64url'),
      };
      const payload = encode(session);
      return `${payload}.${sign(payload)}`;
    },

    verify(token) {
      if (typeof token !== 'string' || token.length > 4096) return null;
      const parts = token.split('.');
      if (parts.length !== 2) return null;

      const [payload, signature] = parts;
      const expected = Buffer.from(sign(payload));
      const actual = Buffer.from(signature);
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

      try {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!session.userId || !ROLES.has(session.role) || !Number.isFinite(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= now()) return null;
        return {
          userId: session.userId,
          role: session.role,
          ...(session.teamId ? { teamId: session.teamId } : {}),
          expiresAt: session.expiresAt,
        };
      } catch {
        return null;
      }
    },
  };
}
