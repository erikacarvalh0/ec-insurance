const STATUS_LABELS = {
  received: 'Received',
  processing: 'Processing',
  manual_review: 'Manual review',
  quoted: 'Quoted',
  contacted: 'Contacted',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const INSURANCE_LABELS = {
  auto: 'Auto',
  residential: 'Residential',
  life: 'Life',
  health: 'Health',
  business: 'Business',
  travel: 'Travel',
};

export function summarizeLeads(leads) {
  return {
    total: leads.length,
    received: leads.filter((lead) => lead.status === 'received').length,
    manualReview: leads.filter((lead) => lead.status === 'manual_review').length,
    quoted: leads.filter((lead) => lead.status === 'quoted').length,
  };
}

export function toAccessibleLeadRows(leads) {
  return leads.map((lead) => ({
    id: lead.id,
    insuranceType: INSURANCE_LABELS[lead.insuranceType] ?? 'Unknown',
    status: STATUS_LABELS[lead.status] ?? 'Unknown',
  }));
}
