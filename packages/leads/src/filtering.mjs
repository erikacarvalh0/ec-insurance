export function filterVisibleLeads(leads, principal, filters = {}) {
  if (!principal) {
    return [];
  }

  const authorized = leads.filter((lead) => {
    if (principal.role === 'admin') {
      return true;
    }

    if (principal.role === 'manager') {
      return Boolean(principal.teamId) && principal.teamId === lead.teamId;
    }

    if (principal.role === 'broker') {
      return (
        Boolean(principal.id) &&
        Boolean(principal.teamId) &&
        principal.teamId === lead.teamId &&
        principal.id === lead.ownerId
      );
    }

    return false;
  });

  return authorized.filter((lead) => (
    !filters.status || lead.status === filters.status
  ));
}
