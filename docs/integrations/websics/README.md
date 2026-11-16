# WebSics integration readiness

No integration endpoint or quotation capability has been verified yet. This project must remain usable without WebSics.

## Discovery checklist

- [ ] Confirm vendor-supported API and its permitted purposes.
- [ ] Obtain official documentation and a non-production environment.
- [ ] Determine whether the platform can quote insurance or only register externally-produced quotes.
- [ ] Confirm supported insurance lines and mandatory inputs per insurer.
- [ ] Clarify authentication, credentials rotation, rate limits, idempotency, and pagination.
- [ ] Document asynchronous quote states, callbacks/webhooks, polling and error codes.
- [ ] Confirm whether prices, coverage, proposal PDFs and customer data are retrievable.
- [ ] Establish contractual, operational and LGPD requirements.

## Architecture boundaries

The application uses an abstract quotation provider. A mock provider supplies synthetic, explicitly labeled fixtures in development. A manual-review path supports production lead intake until verified quoting is available. A future `WebSicsProvider` must implement the same interface and be enabled with a feature flag only after sandbox contract tests.

Never reverse-engineer an authenticated WebSics session, scrape credentials or claim real quotations from mock data.
