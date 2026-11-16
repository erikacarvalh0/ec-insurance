const DISCLAIMER = 'Simulation only. Not a binding insurance offer.';

export function normalizeQuotation(quotation) {
  if (
    !quotation ||
    !['completed', 'manual_review'].includes(quotation.status) ||
    !Array.isArray(quotation.offers)
  ) {
    return {
      status: 'manual_review',
      simulated: false,
      offers: [],
    };
  }

  if (!quotation.simulated) {
    return {
      requestId: quotation.requestId,
      status: 'manual_review',
      simulated: false,
      offers: [],
    };
  }

  return {
    requestId: quotation.requestId,
    status: quotation.status,
    simulated: true,
    disclaimer: DISCLAIMER,
    offers: quotation.offers.map((offer) => ({
      ...offer,
      premium: null,
      simulated: true,
    })),
  };
}
