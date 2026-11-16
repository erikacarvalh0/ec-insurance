import assert from 'node:assert/strict';
import test from 'node:test';

import { toInsuranceIntakePayload } from './payload.mjs';

test('maps public form data into the API nested JSON contract', () => {
  const payload = toInsuranceIntakePayload({
    insuranceType: 'auto',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '11987654321',
    vehicleModel: 'Sedan',
    vehicleYear: '2024',
  }, 'request-1');

  assert.deepEqual(payload, {
    idempotencyKey: 'request-1',
    insuranceType: 'auto',
    contact: { name: 'Jane Doe', email: 'jane@example.com', phone: '11987654321' },
    details: { vehicleModel: 'Sedan', vehicleYear: 2024 },
  });
});

test('rejects unsupported insurance types', () => {
  assert.throws(() => toInsuranceIntakePayload({ insuranceType: 'other' }, 'key'), TypeError);
});

test('does not accept empty idempotency keys', () => {
  assert.throws(() => toInsuranceIntakePayload({ insuranceType: 'auto' }, ''), TypeError);
});

test('maps travel details without losing dates', () => {
  const payload = toInsuranceIntakePayload({
    insuranceType: 'travel',
    name: 'Jane',
    email: 'jane@example.com',
    phone: '11987654321',
    destination: 'Chile',
    departureDate: '2027-01-10',
    returnDate: '2027-01-20',
  }, 'travel-1');

  assert.equal(payload.details.destination, 'Chile');
  assert.equal(payload.details.returnDate, '2027-01-20');
});
