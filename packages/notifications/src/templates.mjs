const TEMPLATES = {
  'lead.received': {
    subject: 'New insurance lead',
    body: (id) => `Lead ${id} was received and is awaiting review.`,
  },
  'quote.completed': {
    subject: 'Insurance quotation updated',
    body: (id) => `Quotation for lead ${id} has been updated.`,
  },
  'quote.manual_review': {
    subject: 'Insurance quotation requires manual review',
    body: (id) => `Lead ${id} requires manual review before a quotation can be issued.`,
  },
};

export function renderNotification(event) {
  const template = TEMPLATES[event?.type];

  if (!template || !event?.leadId) {
    throw new TypeError('Unsupported notification event');
  }

  return {
    subject: template.subject,
    body: template.body(event.leadId),
  };
}
