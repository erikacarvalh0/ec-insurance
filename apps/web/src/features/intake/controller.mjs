import { randomUUID } from 'node:crypto';

export function createIntakeController({ submit, createKey = randomUUID, onStateChange = () => {} }) {
  if (typeof submit !== 'function' || typeof createKey !== 'function') {
    throw new TypeError('Submission and key generator are required');
  }

  let state = { status: 'idle' };
  let key;

  function update(next) {
    state = next;
    onStateChange(state);
  }

  return {
    getState() {
      return { ...state };
    },

    async submit(values) {
      key ??= createKey();
      update({ status: 'submitting' });

      try {
        const result = await submit(values, { idempotencyKey: key });
        update({ status: 'success', result });
        return result;
      } catch (error) {
        update({ status: 'error', message: 'Unable to submit insurance request' });
        throw error;
      }
    },
  };
}
