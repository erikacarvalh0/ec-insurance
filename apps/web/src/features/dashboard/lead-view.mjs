import { summarizeLeads, toAccessibleLeadRows } from './dashboard.mjs';

function canSeeLead(lead, principal) {
  if (principal?.role === 'admin') {
    return true;
  }

  if (!principal?.teamId || lead.teamId !== principal.teamId) {
    return false;
  }

  if (principal.role === 'manager') {
    return true;
  }

  return principal.role === 'broker' &&
    Boolean(principal.id) &&
    lead.ownerId === principal.id;
}

export function buildDashboardLeadView(leads, principal) {
  const visible = leads.filter((lead) => canSeeLead(lead, principal));

  return {
    summary: summarizeLeads(visible),
    rows: toAccessibleLeadRows(visible),
  };
}
