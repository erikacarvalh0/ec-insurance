export async function loginBroker({ email, password }, { fetcher = fetch } = {}) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new TypeError('Email and password are required');
  }
  const response = await fetcher('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Unable to sign in');
  const data = await response.json();
  if (typeof data?.token !== 'string' || !data.token) throw new Error('Unable to sign in');
  return { token: data.token, actor: data.actor };
}
