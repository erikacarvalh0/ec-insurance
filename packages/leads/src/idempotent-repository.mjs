export function createIdempotentLeadRepository(repository) {
  if (
    typeof repository?.findUnique !== 'function' ||
    typeof repository?.create !== 'function'
  ) {
    throw new TypeError('Repository requires findUnique and create');
  }

  return {
    async create(input) {
      if (!input?.idempotencyKey) {
        throw new TypeError('idempotencyKey is required');
      }

      const existing = await repository.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });

      if (existing) {
        return existing;
      }

      return repository.create(input);
    },
  };
}
