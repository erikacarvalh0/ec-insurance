export function createLoginHandler({ verifyCredentials, issueToken }) {
  if (typeof verifyCredentials !== 'function' || typeof issueToken !== 'function') {
    throw new TypeError('Credential verifier and token issuer are required');
  }

  return async function login(request) {
    if (request?.method !== 'POST') {
      return { status: 405, headers: { Allow: 'POST' }, body: { error: 'Method not allowed' } };
    }

    const { email, password } = request?.body ?? {};
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== 'string' || !password.length || password.length > 1024) {
      return { status: 400, body: { error: 'Invalid login request' } };
    }

    try {
      const actor = await verifyCredentials({ email: email.trim().toLowerCase(), password });
      if (!actor) return { status: 401, body: { error: 'Invalid credentials' } };
      const token = issueToken(actor);
      return {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
        body: { token, actor: { userId: actor.userId, role: actor.role } },
      };
    } catch {
      return { status: 401, body: { error: 'Invalid credentials' } };
    }
  };
}
