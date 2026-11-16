import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';

import { parseJsonBody } from './json-body.mjs';

test('parses a small JSON request body', async () => {
  const body = await parseJsonBody(Readable.from(['{"insuranceType":"auto"}']));
  assert.deepEqual(body, { insuranceType: 'auto' });
});

test('rejects malformed JSON', async () => {
  await assert.rejects(parseJsonBody(Readable.from(['{broken'])), SyntaxError);
});

test('rejects oversized request bodies', async () => {
  await assert.rejects(
    parseJsonBody(Readable.from(['{"value":"long"}']), { maxBytes: 5 }),
    RangeError,
  );
});

test('rejects non-object JSON payloads', async () => {
  await assert.rejects(parseJsonBody(Readable.from(['[]'])), TypeError);
});
