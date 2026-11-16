function sessionExpiration(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every(Boolean) || !/^[A-Za-z0-9_-]+$/.test(parts[0])) return null;
  try {
    const payload = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    return Number.isSafeInteger(payload.exp) && Number.isSafeInteger(payload.exp * 1000) ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isSessionTokenActive(token, now = Date.now()) {
  const expiresAt = sessionExpiration(token);
  return expiresAt !== null && expiresAt > now;
}

export function watchSessionExpiration(token, onExpire) {
  const expiresAt = sessionExpiration(token);
  let timer;
  function check() {
    const remaining = expiresAt === null ? 0 : expiresAt - Date.now();
    if (remaining <= 0) {
      onExpire();
      return;
    }
    timer = setTimeout(check, Math.min(remaining, 2_147_483_647));
  }
  check();
  return () => clearTimeout(timer);
}
