const REQUIRED_FIELDS = {
  auto: ['vehicleModel', 'vehicleYear'],
  residential: ['postalCode'],
  life: ['birthDate', 'coverageAmount'],
  health: ['beneficiaries', 'city'],
  business: ['companyRegistration', 'businessActivity'],
  travel: ['destination', 'departureDate', 'returnDate'],
};

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

export function validateInsuranceIntake(input) {
  const errors = [];
  const contact = input?.contact ?? {};
  const details = input?.details ?? {};

  if (!Object.hasOwn(REQUIRED_FIELDS, input?.insuranceType)) {
    errors.push('insuranceType');
  }

  if (typeof contact.name !== 'string' || !contact.name.trim()) {
    errors.push('contact.name');
  }

  if (typeof contact.email !== 'string' || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(contact.email)) {
    errors.push('contact.email');
  }

  if (typeof contact.phone !== 'string' || !/^\\d{10,13}$/.test(contact.phone)) {
    errors.push('contact.phone');
  }

  for (const field of REQUIRED_FIELDS[input?.insuranceType] ?? []) {
    if (!hasValue(details[field])) {
      errors.push(`details.${field}`);
    }
  }

  return { success: errors.length === 0, errors };
}
