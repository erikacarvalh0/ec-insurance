import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { IntakeForm } from './IntakeForm.mjs';

const fields = {
  auto: ['vehicleModel', 'vehicleYear'],
  residential: ['postalCode'],
  life: ['birthDate', 'coverageAmount'],
  health: ['beneficiaries', 'city'],
  business: ['companyRegistration', 'businessActivity'],
  travel: ['destination', 'departureDate', 'returnDate'],
};

for (const [type, names] of Object.entries(fields)) {
  test(`renders required details for ${type} insurance`, () => {
    const html = renderToStaticMarkup(IntakeForm({ insuranceType: type }));
    for (const name of names) {
      assert.match(html, new RegExp(`name="${name}"`));
    }
  });
}
