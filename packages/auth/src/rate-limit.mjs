export function createLoginRateLimiter({ maxAttempts = 5, windowMs = 60_000, now = Date.now } = {}) {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) throw new RangeError('maxAttempts must be positive');
  if (!Number.isSafeInteger(windowMs) || windowMs < 1) throw new RangeError('windowMs must be positive');
  if (typeof now !== 'function') throw new TypeError('Clock is required');

  const attempts = new Map();
  return {
    allow(key) {
      if (typeof key !== 'string' || !key.trim() || key.length > 256) return false;
      const current = now();
      const record = attempts.get(key);
      if (!record || current - record.startedAt >= windowMs || current < record.startedAt) {
        attempts.set(key, { startedAt: current, count: 1 });
        return true;
      }
      if (record.count >= maxAttempts) return false;
      record.count += 1;
      return true;
    },
  };
}
