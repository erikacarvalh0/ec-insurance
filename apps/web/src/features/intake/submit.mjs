import { toInsuranceIntakePayload } from '../../../../../packages/forms/src/payload.mjs';

export async function submitInsuranceIntake(values, {
  fetcher = fetch,
  idempotencyKey,
} = {}) {
  const body = toInsuranceIntakePayload(values, idempotencyKey);
  const response = await fetcher('/api/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    const errors = Array.isArray(result?.errors) ? result.errors.join(', ') : 'Unable to submit insurance request';
    throw new Error(errors);
  }

  return result;
}
