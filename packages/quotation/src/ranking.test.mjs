import assert from 'node:assert/strict';
import test from 'node:test';

import { rankVerifiedOffers } from './ranking.mjs';

test('sorts verified offers by premium', () => {
  const offers = [
    { id: 'b', premium: 200, simulated: false, verified: true },
    { id: 'a', premium: 100, simulated: false, verified: true },
  ];

  assert.deepEqual(rankVerifiedOffers(offers).map((offer) => offer.id), ['a', 'b']);
});

test('excludes simulated and unverified offers', () => {
  const offers = [
    { id: 'mock', premium: 1, simulated: true, verified: true },
    { id: 'unverified', premium: 50, simulated: false, verified: false },
    { id: 'verified', premium: 100, simulated: false, verified: true },
  ];

  assert.deepEqual(rankVerifiedOffers(offers).map((offer) => offer.id), ['verified']);
});

test('rejects invalid premiums and preserves input', () => {
  const offers = [
    { id: 'invalid', premium: -1, simulated: false, verified: true },
    { id: 'valid', premium: 120, simulated: false, verified: true },
  ];

  assert.deepEqual(rankVerifiedOffers(offers).map((offer) => offer.id), ['valid']);
  assert.equal(offers[0].id, 'invalid');
});
