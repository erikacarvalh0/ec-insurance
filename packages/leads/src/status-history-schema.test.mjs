import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const schema=readFileSync(new URL('../../../prisma/schema.prisma',import.meta.url),'utf8');
test('Prisma schema stores lead status transitions and actor identity',()=>{
  assert.match(schema,/model LeadStatusHistory\s*\{/);
  assert.match(schema,/actorId\s+String/);
  assert.match(schema,/fromStatus\s+LeadStatus/);
  assert.match(schema,/toStatus\s+LeadStatus/);
  assert.match(schema,/@@index\(\[leadId, createdAt\]\)/);
});
