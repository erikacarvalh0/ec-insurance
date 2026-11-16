export function createDatabaseClient(PrismaClient) {
  if (typeof PrismaClient !== 'function') {
    throw new TypeError('PrismaClient constructor is required');
  }

  return new PrismaClient();
}

export async function checkDatabaseConnection(client) {
  try {
    await client.$queryRawUnsafe('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
