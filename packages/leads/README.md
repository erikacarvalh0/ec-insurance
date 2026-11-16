# Leads & CRM domain

Own lead intake, assignment, deduplication and lifecycle.

## First RED tests

- Creating a lead returns a stable internal identifier.
- Duplicate submissions with the same idempotency key yield one request.
- Lead ownership can change only with an authorized action.
- Invalid state transitions are rejected and recorded.
- New leads are retained even when quotation processing fails.

Use transport-agnostic domain types and no real personal data in fixtures.
