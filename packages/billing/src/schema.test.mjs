import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('billing migration enforces monetary and idempotency constraints', () => {
  const sql = readFileSync(new URL('../../../prisma/migrations/20261117201100_billing/migration.sql', import.meta.url), 'utf8');
  for (const model of ['Invoice', 'Payment', 'BillingTransaction']) {
    assert.match(sql, new RegExp('CREATE TABLE "' + model + '"'));
    assert.match(sql, new RegExp('"' + model + '_idempotencyKey_key"'));
    assert.match(sql, new RegExp('"' + model + '_amount_nonnegative"'));
  }
});
