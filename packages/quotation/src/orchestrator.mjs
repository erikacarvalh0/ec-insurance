export function createQuotationOrchestrator({ leadStore, provider }) {
  if (!leadStore?.create || !provider?.submitQuote) {
    throw new TypeError('A lead store and quotation provider are required');
  }

  return {
    async submit(input) {
      const lead = await leadStore.create(input);

      try {
        const quotation = await provider.submitQuote({
          requestId: lead.id,
          insuranceType: input.insuranceType,
        });

        return { lead, quotation };
      } catch {
        return {
          lead,
          quotation: {
            requestId: lead.id,
            status: 'manual_review',
            simulated: false,
            offers: [],
          },
        };
      }
    },
  };
}
