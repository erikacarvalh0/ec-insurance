import assert from 'node:assert/strict';
import test from 'node:test';

import { validateInsuranceIntake } from './intake.mjs';

const contact = {
  name: 'Example Customer',
  email: 'customer@example.com',
  phone: '11999999999',
};

test('accepts an auto request with required vehicle information', () => {
  const result = validateInsuranceIntake({
    insuranceType: 'auto',
    contact,
    details: { vehicleModel: 'Example model', vehicleYear: 2022 },
  });

  assert.equal(result.success, true);
});

test('rejects an unsupported insurance type', () => {
  const result = validateInsuranceIntake({
    insuranceType: 'unknown',
    contact,
    details: {},
  });

  assert.equal(result.success, false);
  assert.ok(result.errors.includes('insuranceType'));
});

test('requires product-specific fields', () => {
  const result = validateInsuranceIntake({
    insuranceType: 'travel',
    contact,
    details: { destination: 'Chile' },
  });

  assert.equal(result.success, false);
  assert.ok(result.errors.includes('details.departureDate'));
  assert.ok(result.errors.includes('details.returnDate'));
});

test('rejects incomplete contact information', () => {
  const result = validateInsuranceIntake({
    insuranceType: 'residential',
    contact: { name: 'Example Customer', email: 'invalid' },
    details: { postalCode: '01001000' },
  });

  assert.equal(result.success, false);
  assert.ok(result.errors.includes('contact.email'));
  assert.ok(result.errors.includes('contact.phone'));
});
