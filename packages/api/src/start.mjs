import { createApiServer } from './server.mjs';

const rawPort = process.env.PORT ?? '3001';
const port = Number(rawPort);

if (!Number.isSafeInteger(port) || port < 0 || port > 65535) {
  throw new RangeError('PORT must be an integer between 0 and 65535');
}

const host = process.env.HOST ?? '127.0.0.1';
const server = createApiServer();

server.listen(port, host, () => {
  const address = server.address();
  console.info(`Insurance API listening on ${address.address}:${address.port}`);
});
