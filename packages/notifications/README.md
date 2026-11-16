# Notification contracts

Own transactional events, templates and transport abstraction.

## First RED tests

- New lead event renders broker-facing notification content.
- Quotation completion and manual review have different templates.
- Retries do not create duplicate sends with the same idempotency key.
- Transport errors produce a typed failure and do not lose the lead.
- Test transport cannot send outbound messages.

All emails, phone numbers and customers in tests must be fictional.
