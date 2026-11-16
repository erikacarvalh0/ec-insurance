import { validateInsuranceIntake } from '../../forms/src/intake.mjs';
import { createQuotationOrchestrator } from './orchestrator.mjs';

export function createInsuranceIntakeWorkflow({ leadStore, provider }) {
  const orchestrator = createQuotationOrchestrator({ leadStore, provider });

  return {
    async submit(input) {
      const { success, errors } = validateInsuranceIntake(input);

      if (!input?.idempotencyKey?.trim()) {
        errors.push('idempotencyKey');
      }

      if (!success || errors.length > 0) {
        return { success: false, errors };
      }

      const result = await orchestrator.submit(input);
      return { success: true, ...result };
    },
  };
}
