import { createHash, randomBytes } from 'node:crypto';
import { hashPassword } from './password.mjs';

const digest = (token) => createHash('sha256').update(token).digest('hex');

export function createPasswordResetService({ repository, deliver, now = Date.now, ttlMilliseconds = 900000 }) {
  if (typeof repository?.replace !== 'function' || typeof repository?.consume !== 'function' ||
      typeof deliver !== 'function' || typeof now !== 'function' ||
      !Number.isSafeInteger(ttlMilliseconds) || ttlMilliseconds < 1) {
    throw new TypeError('Password reset repository, delivery, clock and lifetime are required');
  }

  return {
    async request({ email } = {}) {
      const response = { message: 'If the account is eligible, password reset instructions will be sent.' };
      if (typeof email !== 'string') return response;
      email = email.trim().toLowerCase();
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return response;
      try {
        const token = randomBytes(32).toString('base64url');
        const expiresAt = new Date(now() + ttlMilliseconds);
        if (!Number.isFinite(expiresAt.getTime())) throw new TypeError('Invalid reset clock');
        const replaced = await repository.replace({ email, tokenHash: digest(token), expiresAt });
        if (replaced) await deliver({ email, token, expiresAt });
      } catch {
        // Account and delivery failures must not reveal whether the email exists.
      }
      return response;
    },
    async reset({ token, password } = {}) {
      if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token) ||
          Buffer.from(token, 'base64url').toString('base64url') !== token ||
          typeof password !== 'string' || !password.length || Buffer.byteLength(password) > 1024) return false;
      const passwordHash = await hashPassword(password);
      // Check expiry at consumption, after the asynchronous password hashing work.
      const current = new Date(now());
      if (!Number.isFinite(current.getTime())) return false;
      return repository.consume({ tokenHash: digest(token), passwordHash, now: current });
    },
  };
}
