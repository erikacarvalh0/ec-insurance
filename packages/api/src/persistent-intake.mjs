import { validateInsuranceIntake } from '../../forms/src/intake.mjs';

export function createPersistentIntakeHandler({ leadRepository }) {
  if (typeof leadRepository?.create !== 'function') {
    throw new TypeError('Lead repository must implement create');
  }

  return async function handlePersistentIntake(request) {
    if (request?.method !== 'POST') {
      return {
        status: 405,
        headers: { Allow: 'POST' },
        body: { error: 'Method not allowed' },
      };
    }

    const { success, errors } = validateInsuranceIntake(request.body);

    if (!request.body?.idempotencyKey?.trim()) {
      errors.push('idempotencyKey');
    }

    if (!success || errors.length > 0) {
      return { status: 422, body: { errors } };
    }

    try {
      const lead = await leadRepository.create(request.body);
      return { status: 201, body: { success: true, lead } };
    } catch (error) {
      if (error?.code === 'P2002') return { status: 409, body: { error: 'Duplicate intake' } };
      return { status: 500, body: { error: 'Internal server error' } };
    }
  };
}
