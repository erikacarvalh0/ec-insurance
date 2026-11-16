const SUPPORTED_EVENTS = new Set([
  'lead.received',
  'quote.completed',
  'quote.manual_review',
]);

export function createInMemoryNotifier() {
  const recorded = new Map();

  return {
    async notify(event) {
      if (!event?.idempotencyKey || !event.leadId || !SUPPORTED_EVENTS.has(event.type)) {
        throw new TypeError('Invalid notification event');
      }

      if (recorded.has(event.idempotencyKey)) {
        return recorded.get(event.idempotencyKey).result;
      }

      const result = {
        status: 'recorded',
        idempotencyKey: event.idempotencyKey,
      };

      recorded.set(event.idempotencyKey, { event: { ...event }, result });
      return result;
    },

    events() {
      return [...recorded.values()].map(({ event }) => ({ ...event }));
    },
  };
}
