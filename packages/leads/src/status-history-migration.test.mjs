import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../../../prisma/migrations/20261116170000_lead_status_history/migration.sql', import.meta.url), 'utf8');
test('history migration creates foreign key and indexed immutable audit columns', () => {
  assert.match(sql, /CREATE TABLE "LeadStatusHistory"/);
  assert.match(sql, /"fromStatus" "LeadStatus" NOT NULL/);
  assert.match(sql, /"toStatus" "LeadStatus" NOT NULL/);
  assert.match(sql, /FOREIGN KEY \("leadId"\) REFERENCES "Lead"\("id"\)/);
  assert.match(sql, /CREATE INDEX "LeadStatusHistory_leadId_createdAt_idx"/);
  assert.match(sql, /CREATE INDEX "LeadStatusHistory_actorId_createdAt_idx"/);
});
