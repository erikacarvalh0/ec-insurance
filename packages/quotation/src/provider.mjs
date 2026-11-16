const SUPPORTED_TYPES = new Set([
  'auto',
  'residential',
  'life',
  'health',
  'business',
  'travel',
]);

export function createMockQuotationProvider() {
  return {
    async submitQuote(request) {
      if (typeof request?.requestId !== 'string' || !request.requestId.trim()) {
        throw new TypeError('A requestId is required');
      }

      if (!SUPPORTED_TYPES.has(request.insuranceType)) {
        return {
          requestId: request.requestId,
          status: 'manual_review',
          simulated: true,
          offers: [],
        };
      }

      return {
        requestId: request.requestId,
        status: 'completed',
        simulated: true,
        offers: [
          {
            id: `mock-${request.requestId}`,
            provider: 'Mock provider — not an insurer',
            premium: null,
            currency: 'BRL',
            simulated: true,
          },
        ],
      };
    },
  };
}
