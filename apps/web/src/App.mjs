import { createElement as h, useState } from 'react';
import { InteractiveIntakeForm } from './features/intake/InteractiveIntakeForm.mjs';
import { Navigation } from './Navigation.mjs';
import { BrokerDashboard } from './features/dashboard/BrokerDashboard.mjs';

const TYPES = ['auto', 'residential', 'life', 'health', 'business', 'travel'];

export function App({ pathname = typeof window === 'undefined' ? '/' : window.location.pathname, token }) {
  const [insuranceType, setInsuranceType] = useState('auto');

  const brokerView = pathname === '/broker';

  return h('main', null,
    h('header', null, h('h1', null, 'EC Insurance'), h(Navigation, { view: brokerView ? 'broker' : 'public' })),
    brokerView ? h(BrokerDashboard, { token }) : h('nav', { 'aria-label': 'Insurance products' },
      h('label', { htmlFor: 'insurance-product' }, 'Choose your insurance'),
      h('select', {
        id: 'insurance-product',
        value: insuranceType,
        onChange: (event) => setInsuranceType(event.target.value),
      }, ...TYPES.map((type) => h('option', { key: type, value: type }, type))),
    ),
    !brokerView && h(InteractiveIntakeForm, { key: insuranceType, insuranceType }),
  );
}
