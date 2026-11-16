export async function fetchBrokerLeads({ token, fetcher = fetch } = {}) {
  if (typeof token !== 'string' || !token.trim()) {
    throw new TypeError('An authenticated session is required');
  }

  const response = await fetcher('/api/leads', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Unable to load leads');
  }

  const result = await response.json();
  if (!Array.isArray(result?.leads)) {
    throw new Error('Unable to load leads');
  }
  return result.leads;
}
