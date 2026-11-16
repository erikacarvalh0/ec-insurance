import assert from 'node:assert/strict';
import test from 'node:test';
import { createLeadStatusAuditEntry } from './status-audit.mjs';

test('creates minimal status audit entry with actor and timestamp',()=>{
  const entry=createLeadStatusAuditEntry({leadId:'l1',actorId:'b1',from:'RECEIVED',to:'PROCESSING',at:new Date('2026-01-01T00:00:00Z')});
  assert.deepEqual(entry,{leadId:'l1',actorId:'b1',fromStatus:'RECEIVED',toStatus:'PROCESSING',createdAt:new Date('2026-01-01T00:00:00Z')});
});

test('rejects missing actor and same-status transitions',()=>{
  assert.throws(()=>createLeadStatusAuditEntry({leadId:'l1',from:'RECEIVED',to:'RECEIVED'}),/Invalid audit/);
});
