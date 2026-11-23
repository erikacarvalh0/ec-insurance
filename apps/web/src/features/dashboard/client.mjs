export async function fetchBrokerLeads({ token, limit, offset, status, insuranceType, search, ownerId, from, to, fetcher = fetch } = {}) {
  if (typeof token !== 'string' || !token.trim()) {
    throw new TypeError('An authenticated session is required');
  }

  if ((limit !== undefined && (!Number.isSafeInteger(limit) || limit < 1 || limit > 100)) ||
      (offset !== undefined && (!Number.isSafeInteger(offset) || offset < 0 || offset > 100_000))) {
    throw new RangeError('Invalid pagination');
  }
  if (status !== undefined && !['received', 'processing', 'quoted', 'manual_review', 'contacted', 'completed', 'cancelled'].includes(status)) throw new TypeError('Invalid status filter');
  if (insuranceType !== undefined && !['auto', 'residential', 'life', 'health', 'business', 'travel'].includes(insuranceType)) throw new TypeError('Invalid insurance filter');
  if (search !== undefined && (typeof search !== 'string' || !/^[A-Za-z0-9_-]{2,64}$/.test(search))) throw new TypeError('Invalid search');
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  if (ownerId !== undefined && (typeof ownerId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(ownerId))) throw new TypeError('Invalid owner filter');
  if ((from !== undefined && !validDate(from)) || (to !== undefined && !validDate(to)) || (from && to && from >= to)) throw new TypeError('Invalid period');
  const query = new URLSearchParams();
  if (ownerId !== undefined) query.set('ownerId', ownerId);
  if (from !== undefined) query.set('from', from);
  if (to !== undefined) query.set('to', to);
  if (limit !== undefined) query.set('limit', String(limit));
  if (offset !== undefined) query.set('offset', String(offset));
  if (status !== undefined) query.set('status', status);
  if (insuranceType !== undefined) query.set('insuranceType', insuranceType);
  if (search !== undefined) query.set('search', search);
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
