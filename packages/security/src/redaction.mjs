const SENSITIVE_KEYS = new Set([
  'name',
  'email',
  'phone',
  'cpf',
  'cnpj',
  'birthdate',
  'diagnosis',
  'medicalhistory',
  'password',
  'token',
  'authorization',
]);

export function redactSensitiveData(value) {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase())
        ? '[REDACTED]'
        : redactSensitiveData(nested),
    ]),
  );
}
