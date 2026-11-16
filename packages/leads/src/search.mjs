export function searchLeads(leads, filters = {}) {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();

  return leads.filter((lead) => {
    const name = (lead.contact?.name ?? '').toLocaleLowerCase();

    return (
      (!query || name.includes(query)) &&
      (!filters.insuranceType || lead.insuranceType === filters.insuranceType) &&
      (!filters.status || lead.status === filters.status)
    );
  });
}
