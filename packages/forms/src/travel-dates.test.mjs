import assert from 'node:assert/strict';
import test from 'node:test';

import { validateTravelDates } from './travel-dates.mjs';

test('accepts an ordered date range', () => {
  assert.deepEqual(validateTravelDates('2027-02-10', '2027-02-20'), {
    success: true,
    errors: [],
  });
});

test('rejects return dates before departure', () => {
  assert.deepEqual(validateTravelDates('2027-02-20', '2027-02-10'), {
    success: false,
    errors: ['returnDate'],
  });
});

test('rejects impossible calendar dates', () => {
  assert.deepEqual(validateTravelDates('2027-02-30', '2027-03-10'), {
    success: false,
    errors: ['departureDate'],
  });
});

test('rejects missing dates', () => {
  assert.deepEqual(validateTravelDates('', ''), {
    success: false,
    errors: ['departureDate', 'returnDate'],
  });
});
