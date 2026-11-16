import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../../../prisma/migrations/20261116000000_init/migration.sql', import.meta.url), 'utf8');

test('creates lead and quotation tables with relational integrity', () => {
  assert.match(sql, /CREATE TABLE "Lead"/);
  assert.match(sql, /CREATE TABLE "Quotation"/);
  assert.match(sql, /FOREIGN KEY \("leadId"\) REFERENCES "Lead"\("id"\)/);
});

test('enforces unique lead idempotency keys', () => {
  assert.match(sql, /CREATE UNIQUE INDEX "Lead_idempotencyKey_key"/);
});

test('defines insurance and lead status enums', () => {
  assert.match(sql, /CREATE TYPE "InsuranceType"/);
  assert.match(sql, /CREATE TYPE "LeadStatus"/);
});
