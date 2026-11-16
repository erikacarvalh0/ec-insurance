export function createLoginRateLimiter({ maxAttempts = 5, windowMs = 60_000, maxKeys = 10_000, now = Date.now } = {}) {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) throw new RangeError('maxAttempts must be positive');
  if (!Number.isSafeInteger(windowMs) || windowMs < 1) throw new RangeError('windowMs must be positive');
  if (!Number.isSafeInteger(maxKeys) || maxKeys < 1) throw new RangeError('maxKeys must be positive');
  if (typeof now !== 'function') throw new TypeError('Clock is required');

  const attempts = new Map();
  return {
    allow(key) {
      if (typeof key !== 'string' || !key.trim() || key.length > 256) return false;
      const current = now();
      const record = attempts.get(key);
      if (!record && attempts.size >= maxKeys) {
        for (const [storedKey, value] of attempts) {
          if (current < value.startedAt || current - value.startedAt >= windowMs) attempts.delete(storedKey);
        }
        if (attempts.size >= maxKeys) return false;
      }
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
