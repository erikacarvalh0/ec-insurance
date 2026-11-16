import { randomUUID } from 'node:crypto';

const ALLOWED_TRANSITIONS = {
  received: new Set(['processing', 'manual_review', 'cancelled']),
  processing: new Set(['quoted', 'manual_review', 'cancelled']),
  quoted: new Set(['contacted', 'cancelled']),
  manual_review: new Set(['quoted', 'contacted', 'cancelled']),
  contacted: new Set(['completed', 'cancelled']),
  completed: new Set(),
  cancelled: new Set(),
};

export function createLeadStore() {
  const leads = new Map();
  const idempotencyKeys = new Map();

  return {
    create(input) {
      if (!input?.idempotencyKey || !input.insuranceType || !input.contact?.name) {
        throw new TypeError('A key, insurance type and contact name are required');
      }

      if (idempotencyKeys.has(input.idempotencyKey)) {
        return leads.get(idempotencyKeys.get(input.idempotencyKey));
      }

      const lead = {
        id: randomUUID(),
        insuranceType: input.insuranceType,
        contact: { ...input.contact },
        status: 'received',
      };

      leads.set(lead.id, lead);
      idempotencyKeys.set(input.idempotencyKey, lead.id);

      return lead;
    },

    transition(id, nextStatus) {
      const lead = leads.get(id);

      if (!lead) {
        throw new TypeError('Lead not found');
      }

      if (!ALLOWED_TRANSITIONS[lead.status]?.has(nextStatus)) {
        throw new Error(`Invalid transition: ${lead.status} -> ${nextStatus}`);
      }

      lead.status = nextStatus;
      return lead;
    },

    list() {
      return [...leads.values()];
    },
  };
}
