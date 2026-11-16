# Quotation provider

This package defines a vendor-neutral provider interface; it cannot depend on WebSics-specific APIs.

## First RED tests

- Accepted requests receive a stable quotation request identifier.
- An unsupported insurance line produces a typed error.
- A mock response is always marked `simulated: true`.
- Multiple synthetic offers may be returned without presenting them as real prices.
- Provider timeouts and errors trigger manual review, without discarding the lead.

Mock output is for development and demonstration only; real quotations require verified, authorized provider integrations.
