import assert from 'node:assert/strict';
import test from 'node:test';

import { redactSensitiveData } from './redaction.mjs';

test('preserves null and primitive values', () => {
  assert.equal(redactSensitiveData(null), null);
  assert.equal(redactSensitiveData(42), 42);
});

test('redacts case-insensitive sensitive keys without mutating input', () => {
  const input = { nested: { EMAIL: 'example@example.com', count: 2 } };
  assert.deepEqual(redactSensitiveData(input), {
    nested: { EMAIL: '[REDACTED]', count: 2 },
  });
  assert.equal(input.nested.EMAIL, 'example@example.com');
});
