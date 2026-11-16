export function paginateLeads(leads, { page = 1, pageSize = 20 } = {}) {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError('page must be a positive integer');
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new RangeError('pageSize must be between 1 and 100');
  }

  const start = (page - 1) * pageSize;

  return {
    items: leads.slice(start, start + pageSize),
    page,
    pageSize,
    total: leads.length,
    totalPages: Math.ceil(leads.length / pageSize),
  };
}
