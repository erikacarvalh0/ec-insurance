export function filterBrokerLeads(leads, status = 'all') {
  if (!Array.isArray(leads)) throw new TypeError('Leads must be an array');
  if (status === 'all') return [...leads];
  return leads.filter((lead) => lead.status === status);
}
