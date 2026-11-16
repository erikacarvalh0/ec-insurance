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

test('parses a UTF-8 character split across chunks at the exact byte limit', async () => {
  const payload = Buffer.from('{"value":"é"}');
  const split = payload.indexOf(Buffer.from('é')) + 1;

  const body = await parseJsonBody(
    Readable.from([payload.subarray(0, split), payload.subarray(split)]),
    { maxBytes: payload.byteLength },
  );

  assert.deepEqual(body, { value: 'é' });
});

test('enforces the cumulative byte limit across request chunks', async () => {
  await assert.rejects(
    parseJsonBody(Readable.from(['{"value":', '"long"}']), { maxBytes: 10 }),
    { name: 'RangeError', message: 'JSON request body is too large' },
  );
});

test('counts UTF-8 bytes instead of characters toward the request limit', async () => {
  const payload = '{"value":"é"}';

  await assert.rejects(
    parseJsonBody(Readable.from([payload]), { maxBytes: payload.length }),
    { name: 'RangeError', message: 'JSON request body is too large' },
  );
});

test('rejects non-object JSON payloads', async () => {
  await assert.rejects(parseJsonBody(Readable.from(['[]'])), TypeError);
});
