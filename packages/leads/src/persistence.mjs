const INSURANCE_TYPES = new Set([
  'auto', 'residential', 'life', 'health', 'business', 'travel',
]);

export function toLeadCreateData(input) {
  if (!INSURANCE_TYPES.has(input?.insuranceType)) {
    throw new TypeError('Unsupported insurance type');
  }

  if (
    !input.idempotencyKey ||
    !input.contact?.name ||
    !input.contact?.email ||
    !input.contact?.phone
  ) {
    throw new TypeError('Lead contact and idempotency key are required');
  }

  return {
    idempotencyKey: input.idempotencyKey,
    insuranceType: input.insuranceType.toUpperCase(),
    status: 'RECEIVED',
    contactName: input.contact.name,
    contactEmail: input.contact.email,
    contactPhone: input.contact.phone,
  };
}

export function fromLeadRecord(record) {
  return {
    id: record.id,
    insuranceType: record.insuranceType.toLowerCase(),
    status: record.status.toLowerCase(),
    contact: {
      name: record.contactName,
      email: record.contactEmail,
      phone: record.contactPhone,
    },
  };
}
