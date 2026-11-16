import assert from 'node:assert/strict';
import test from 'node:test';

import { createLeadStore } from './leads.mjs';

test('creates a lead and preserves it for manual quotation', () => {
  const store = createLeadStore();
  const lead = store.create({
    idempotencyKey: 'submit-1',
    insuranceType: 'residential',
    contact: { name: 'Example Customer' },
  });

  assert.equal(lead.status, 'received');
  assert.equal(lead.insuranceType, 'residential');
  assert.ok(lead.id);
});

test('deduplicates requests by idempotency key', () => {
  const store = createLeadStore();
  const input = {
    idempotencyKey: 'submit-2',
    insuranceType: 'travel',
    contact: { name: 'Example Customer' },
  };

  assert.strictEqual(store.create(input), store.create(input));
  assert.equal(store.list().length, 1);
});

test('does not permit invalid status transitions', () => {
  const store = createLeadStore();
  const lead = store.create({
    idempotencyKey: 'submit-3',
    insuranceType: 'auto',
    contact: { name: 'Example Customer' },
  });

  assert.throws(() => store.transition(lead.id, 'completed'), /Invalid transition/);
});
