import { createElement as h } from 'react';

const FIELD_GROUPS = {
  auto: [['vehicleModel', 'Vehicle model'], ['vehicleYear', 'Vehicle year', 'number']],
  residential: [['postalCode', 'Postal code']],
  life: [['birthDate', 'Date of birth', 'date'], ['coverageAmount', 'Coverage amount', 'number']],
  health: [['beneficiaries', 'Beneficiaries', 'number'], ['city', 'City']],
  business: [['companyRegistration', 'Company registration'], ['businessActivity', 'Business activity']],
  travel: [['destination', 'Destination'], ['departureDate', 'Departure date', 'date'], ['returnDate', 'Return date', 'date']],
};

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

export function IntakeForm({ insuranceType = 'auto', onSubmit }) {
  const selectedType = Object.hasOwn(FIELD_GROUPS, insuranceType) ? insuranceType : 'auto';

  return h('section', { 'aria-labelledby': 'intake-title' },
    h('h1', { id: 'intake-title' }, 'Request insurance quotation'),
    h('form', { method: 'post', action: '/api/intake', onSubmit },
      h('input', { type: 'hidden', name: 'insuranceType', value: selectedType }),
      field('name', 'Full name'),
      field('email', 'Email address', 'email'),
      field('phone', 'Phone number', 'tel'),
      h('fieldset', null,
        h('legend', null, 'Insurance details'),
        ...FIELD_GROUPS[selectedType].map(([name, label, type]) => field(name, label, type)),
      ),
      h('button', { type: 'submit' }, 'Request quotation'),
    ),
  );
}
