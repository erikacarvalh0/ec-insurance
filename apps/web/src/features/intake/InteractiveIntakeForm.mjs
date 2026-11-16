import { createElement as h, useRef, useState } from 'react';

import { IntakeForm } from './IntakeForm.mjs';
import { createIntakeController } from './controller.mjs';
import { submitInsuranceIntake } from './submit.mjs';

const defaultCreateKey = () => crypto.randomUUID();

export function InteractiveIntakeForm({
  insuranceType = 'auto',
  submit = submitInsuranceIntake,
  createKey = defaultCreateKey,
}) {
  const [state, setState] = useState({ status: 'idle' });
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = createIntakeController({ submit, createKey, onStateChange: setState });
  }
  const controller = controllerRef.current;

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.status === 'submitting') return;

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    await controller.submit(values).catch(() => {});
  }

  return h('div', null,
    h(IntakeForm, { insuranceType, onSubmit: handleSubmit }),
    h('p', { role: 'status', 'aria-live': 'polite' },
      state.status === 'submitting' ? 'Submitting request...' :
      state.status === 'success' ? 'Request submitted successfully' :
      state.status === 'error' ? state.message : '',
    ),
  );
}
