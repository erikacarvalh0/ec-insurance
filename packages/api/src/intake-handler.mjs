export function createIntakeHandler(workflow) {
  if (typeof workflow?.submit !== 'function') {
    throw new TypeError('An intake workflow with submit is required');
  }

  return async function handleIntake(request) {
    if (request?.method !== 'POST') {
      return {
        status: 405,
        headers: { Allow: 'POST' },
        body: { error: 'Method not allowed' },
      };
    }

    try {
      const result = await workflow.submit(request.body);

      if (!result.success) {
        return { status: 422, body: { errors: result.errors } };
      }

      return { status: 201, body: result };
    } catch {
      return { status: 500, body: { error: 'Internal server error' } };
    }
  };
}
