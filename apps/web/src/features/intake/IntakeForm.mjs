import { createElement as h } from 'react';

const TYPES = new Set(['auto', 'residential', 'life', 'health', 'business', 'travel']);

function field(name, label, type = 'text') {
  return h('div', { key: name },
    h('label', { htmlFor: `intake-${name}` }, label),
    h('input', {
      id: `intake-${name}`,
      name,
      type,
      required: true,
      autoComplete: name === 'name' ? 'name' : name === 'email' ? 'email' : name === 'phone' ? 'tel' : undefined,
    }),
  );
}

export function IntakeForm({ insuranceType = 'auto' }) {
  const selectedType = TYPES.has(insuranceType) ? insuranceType : 'auto';

  return h('section', { 'aria-labelledby': 'intake-title' },
    h('h1', { id: 'intake-title' }, 'Request insurance quotation'),
    h('form', { method: 'post', action: '/api/intake' },
      h('input', { type: 'hidden', name: 'insuranceType', value: selectedType }),
      field('name', 'Full name'),
      field('email', 'Email address', 'email'),
      field('phone', 'Phone number', 'tel'),
      h('button', { type: 'submit' }, 'Request quotation'),
    ),
  );
}
