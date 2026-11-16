export async function fetchBrokerLeads({ token, limit, offset, fetcher = fetch } = {}) {
  if (typeof token !== 'string' || !token.trim()) {
    throw new TypeError('An authenticated session is required');
  }

  if ((limit !== undefined && (!Number.isSafeInteger(limit) || limit < 1 || limit > 100)) ||
      (offset !== undefined && (!Number.isSafeInteger(offset) || offset < 0 || offset > 100_000))) {
    throw new RangeError('Invalid pagination');
  }
  const query = new URLSearchParams();
  if (limit !== undefined) query.set('limit', String(limit));
  if (offset !== undefined) query.set('offset', String(offset));
  const url = query.size ? `/api/leads?${query}` : '/api/leads';
  const response = await fetcher(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = new Error('Unable to load leads');
    error.status = response.status;
    throw error;
  }

  const result = await response.json();
  if (!Array.isArray(result?.leads)) {
    throw new Error('Unable to load leads');
  }
  return result.leads;
}
