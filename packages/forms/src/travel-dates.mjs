function parseCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function validateTravelDates(departureDate, returnDate) {
  const errors = [];
  const departure = parseCalendarDate(departureDate);
  const returning = parseCalendarDate(returnDate);

  if (!departure) {
    errors.push('departureDate');
  }

  if (!returning || (departure && returning < departure)) {
    errors.push('returnDate');
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
