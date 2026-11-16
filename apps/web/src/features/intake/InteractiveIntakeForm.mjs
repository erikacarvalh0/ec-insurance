import { createElement as h, useMemo, useState } from 'react';

import { IntakeForm } from './IntakeForm.mjs';
import { createIntakeController } from './controller.mjs';
import { submitInsuranceIntake } from './submit.mjs';

export function InteractiveIntakeForm({
  insuranceType = 'auto',
  submit = submitInsuranceIntake,
  createKey = () => crypto.randomUUID(),
}) {
  const [state, setState] = useState({ status: 'idle' });
  const controller = useMemo(() => createIntakeController({
    submit,
    createKey,
    onStateChange: setState,
  }), [submit, createKey]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.status === 'submitting') return;

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    await controller.submit(values).catch(() => {});
  }

  return h('div', null,
    h('div', { onSubmit: handleSubmit }, h(IntakeForm, { insuranceType })),
    h('p', { role: 'status', 'aria-live': 'polite' },
      state.status === 'submitting' ? 'Submitting request...' :
      state.status === 'success' ? 'Request submitted successfully' :
      state.status === 'error' ? state.message : '',
    ),
  );
}
