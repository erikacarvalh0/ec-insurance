export function isSessionTokenActive(token, now = Date.now()) {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every(Boolean) || !/^[A-Za-z0-9_-]+$/.test(parts[0])) return false;
  try {
    const payload = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    return Number.isSafeInteger(payload.exp) && payload.exp > Math.floor(now / 1000);
  } catch {
    return false;
  }
}
