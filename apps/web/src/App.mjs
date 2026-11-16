import { createElement as h, useState } from 'react';
import { InteractiveIntakeForm } from './features/intake/InteractiveIntakeForm.mjs';

const TYPES = ['auto', 'residential', 'life', 'health', 'business', 'travel'];

export function App() {
  const [insuranceType, setInsuranceType] = useState('auto');

  return h('main', null,
    h('header', null, h('h1', null, 'EC Insurance')),
    h('nav', { 'aria-label': 'Insurance products' },
      h('label', { htmlFor: 'insurance-product' }, 'Choose your insurance'),
      h('select', {
        id: 'insurance-product',
        value: insuranceType,
        onChange: (event) => setInsuranceType(event.target.value),
      }, ...TYPES.map((type) => h('option', { key: type, value: type }, type))),
    ),
    h(InteractiveIntakeForm, { key: insuranceType, insuranceType }),
  );
}
