export function createNotificationQueue() {
  const messages = new Map();

  return {
    enqueue(message) {
      if (!message?.idempotencyKey) {
        throw new TypeError('idempotencyKey is required');
      }

      if (messages.has(message.idempotencyKey)) {
        return { status: 'duplicate' };
      }

      messages.set(message.idempotencyKey, { ...message });
      return { status: 'queued' };
    },

    acknowledge(idempotencyKey) {
      return messages.delete(idempotencyKey);
    },

    pending() {
      return [...messages.values()].map((message) => ({ ...message }));
    },
  };
}
