import assert from 'node:assert/strict';
import test from 'node:test';

import { redactSensitiveData } from './redaction.mjs';

test('redacts personal and health details recursively', () => {
  const input = {
    leadId: 'lead-1',
    contact: {
      email: 'customer@example.com',
      phone: '11999999999',
      name: 'Example Customer',
    },
    medical: { diagnosis: 'fictional' },
  };

  assert.deepEqual(redactSensitiveData(input), {
    leadId: 'lead-1',
    contact: { email: '[REDACTED]', phone: '[REDACTED]', name: '[REDACTED]' },
    medical: { diagnosis: '[REDACTED]' },
  });
  assert.equal(input.contact.email, 'customer@example.com');
});

test('redacts sensitive values inside arrays', () => {
  assert.deepEqual(redactSensitiveData([{ cpf: '00000000000' }]), [
    { cpf: '[REDACTED]' },
  ]);
});
