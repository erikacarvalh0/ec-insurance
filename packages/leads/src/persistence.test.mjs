import assert from 'node:assert/strict';
import test from 'node:test';

import { toLeadCreateData, fromLeadRecord } from './persistence.mjs';

const input = {
  idempotencyKey: 'req-1',
  insuranceType: 'auto',
  contact: {
    name: 'Example Customer',
    email: 'customer@example.com',
    phone: '11987654321',
  },
};

test('maps domain intake to Prisma lead create data', () => {
  assert.deepEqual(toLeadCreateData(input), {
    idempotencyKey: 'req-1',
    insuranceType: 'AUTO',
    status: 'RECEIVED',
    contactName: 'Example Customer',
    contactEmail: 'customer@example.com',
    contactPhone: '11987654321',
  });
});

test('maps persisted lead back to domain representation', () => {
  assert.deepEqual(fromLeadRecord({
    id: 'lead-1',
    insuranceType: 'TRAVEL',
    status: 'MANUAL_REVIEW',
    contactName: 'Example Customer',
    contactEmail: 'customer@example.com',
    contactPhone: '11987654321',
  }), {
    id: 'lead-1',
    insuranceType: 'travel',
    status: 'manual_review',
    contact: {
      name: 'Example Customer',
      email: 'customer@example.com',
      phone: '11987654321',
    },
  });
});

test('rejects unknown insurance types before persistence', () => {
  assert.throws(() => toLeadCreateData({ ...input, insuranceType: 'unknown' }), TypeError);
});
