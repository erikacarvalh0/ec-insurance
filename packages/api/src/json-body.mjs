export async function parseJsonBody(stream, { maxBytes = 64 * 1024 } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new RangeError('maxBytes must be a positive integer');
  }

  const chunks = [];
  let bytes = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;

    if (bytes > maxBytes) {
      throw new RangeError('JSON request body is too large');
    }

    chunks.push(buffer);
  }

  const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('JSON request body must be an object');
  }

  return payload;
}
