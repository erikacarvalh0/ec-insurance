function parseTimestamp(value) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new TypeError('A valid ISO timestamp is required');
  }

  return Date.parse(value);
}

export function getQuotationValidity({ expiresAt, now }) {
  const currentTime = parseTimestamp(now);

  if (expiresAt === null || expiresAt === undefined) {
    return 'unknown';
  }

  return parseTimestamp(expiresAt) <= currentTime ? 'expired' : 'valid';
}
