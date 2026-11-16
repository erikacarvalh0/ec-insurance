import assert from 'node:assert/strict';
import test from 'node:test';
import { nextLeadOffset, previousLeadOffset } from './pagination.mjs';

test('advances only when a full page was received', () => {
  assert.equal(nextLeadOffset(0, 20, 20), 20);
  assert.equal(nextLeadOffset(20, 20, 3), 20);
  assert.equal(previousLeadOffset(20, 20), 0);
  assert.equal(previousLeadOffset(0, 20), 0);
});
