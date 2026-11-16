export function createConflictSafeLeadRepository(repository) {
  if (
    typeof repository?.create !== 'function' ||
    typeof repository?.findUnique !== 'function'
  ) {
    throw new TypeError('Repository must implement create and findUnique');
  }

  return {
    async create(input) {
      if (!input?.idempotencyKey) {
        throw new TypeError('idempotencyKey is required');
      }

      try {
        return await repository.create(input);
      } catch (error) {
        const target = error?.meta?.target;
        const isIdempotencyConflict = error?.code === 'P2002' &&
          Array.isArray(target) &&
          target.includes('idempotencyKey');

        if (!isIdempotencyConflict) {
          throw error;
        }

        const existing = await repository.findUnique({
          where: { idempotencyKey: input.idempotencyKey },
        });

        if (!existing) {
          throw error;
        }

        return existing;
      }
    },
  };
}
