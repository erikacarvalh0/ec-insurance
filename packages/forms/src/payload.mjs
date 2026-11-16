const FIELDS_BY_TYPE = {
  auto: ['vehicleModel', 'vehicleYear'],
  residential: ['postalCode'],
  life: ['birthDate', 'coverageAmount'],
  health: ['beneficiaries', 'city'],
  business: ['companyRegistration', 'businessActivity'],
  travel: ['destination', 'departureDate', 'returnDate'],
};

export function toInsuranceIntakePayload(values, idempotencyKey) {
  if (!Object.hasOwn(FIELDS_BY_TYPE, values?.insuranceType)) {
    throw new TypeError('Unsupported insurance type');
  }

  if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
    throw new TypeError('Idempotency key is required');
  }

  const details = {};

  for (const field of FIELDS_BY_TYPE[values.insuranceType]) {
    const value = values[field];

    if (value !== undefined && value !== null) {
      details[field] = ['vehicleYear', 'coverageAmount', 'beneficiaries'].includes(field)
        ? Number(value)
        : value;
    }
  }

  return {
    idempotencyKey,
    insuranceType: values.insuranceType,
    contact: {
      name: values.name,
      email: values.email,
      phone: values.phone,
    },
    details,
  };
}
