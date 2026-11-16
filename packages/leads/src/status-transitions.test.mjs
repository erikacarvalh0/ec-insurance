import assert from 'node:assert/strict';
import test from 'node:test';
import { canTransitionLeadStatus } from './status-transitions.mjs';

test('allows progression through supported lead lifecycle',()=>{
  assert.equal(canTransitionLeadStatus('RECEIVED','PROCESSING'),true);
  assert.equal(canTransitionLeadStatus('PROCESSING','QUOTED'),true);
  assert.equal(canTransitionLeadStatus('QUOTED','COMPLETED'),true);
});

test('rejects terminal transitions and unknown states',()=>{
  assert.equal(canTransitionLeadStatus('COMPLETED','PROCESSING'),false);
  assert.equal(canTransitionLeadStatus('CANCELLED','RECEIVED'),false);
  assert.equal(canTransitionLeadStatus('INVALID','RECEIVED'),false);
});
