export function createNotificationDispatcher(adapter) {
  if (typeof adapter?.send !== 'function') {
    throw new TypeError('Notification adapter must provide send');
  }

  const delivered = new Set();

  return {
    async dispatch(message) {
      if (!message?.idempotencyKey || !message?.subject || !message?.body) {
        throw new TypeError('Notification message is incomplete');
      }

      if (delivered.has(message.idempotencyKey)) {
        return { status: 'duplicate' };
      }

      try {
        await adapter.send(message);
        delivered.add(message.idempotencyKey);
        return { status: 'sent' };
      } catch {
        return { status: 'failed' };
      }
    },
  };
}
