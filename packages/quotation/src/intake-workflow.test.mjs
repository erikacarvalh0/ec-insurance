import assert from 'node:assert/strict';
import test from 'node:test';

import { createLeadStore } from '../../leads/src/leads.mjs';
import { createMockQuotationProvider } from './provider.mjs';
import { createInsuranceIntakeWorkflow } from './intake-workflow.mjs';

function validInput() {
  return {
    idempotencyKey: 'request-1',
    insuranceType: 'auto',
    contact: {
      name: 'Example Customer',
      email: 'customer@example.com',
      phone: '11987654321',
    },
    details: { vehicleModel: 'Sedan', vehicleYear: 2023 },
  };
}

test('valid intake creates a lead and simulated quotation', async () => {
  const workflow = createInsuranceIntakeWorkflow({
    leadStore: createLeadStore(),
    provider: createMockQuotationProvider(),
  });

  const result = await workflow.submit(validInput());
  assert.equal(result.success, true);
  assert.equal(result.lead.status, 'received');
  assert.equal(result.quotation.simulated, true);
  assert.equal(result.quotation.offers[0].premium, null);
});

test('invalid intake does not create a lead', async () => {
  const leadStore = createLeadStore();
  const workflow = createInsuranceIntakeWorkflow({
    leadStore,
    provider: createMockQuotationProvider(),
  });

  const result = await workflow.submit({ ...validInput(), details: {} });
  assert.equal(result.success, false);
  assert.ok(result.errors.includes('details.vehicleModel'));
  assert.equal(leadStore.list().length, 0);
});

test('requires idempotency key before submission', async () => {
  const workflow = createInsuranceIntakeWorkflow({
    leadStore: createLeadStore(),
    provider: createMockQuotationProvider(),
  });

  const result = await workflow.submit({ ...validInput(), idempotencyKey: '' });
  assert.equal(result.success, false);
  assert.ok(result.errors.includes('idempotencyKey'));
});
