# Leads & CRM domain

Own lead intake, assignment, deduplication and lifecycle.

## First RED tests

- Creating a lead returns a stable internal identifier.
- Duplicate submissions with the same idempotency key yield one request.
- Lead ownership can change only with an authorized action.
- Invalid state transitions are rejected and recorded.
- New leads are retained even when quotation processing fails.

Use transport-agnostic domain types and no real personal data in fixtures.

## Persisted status history API

`GET /api/leads/:id/status-history?limit=20&offset=0` requires a Bearer
session token. Brokers can read their own leads, managers their team's leads,
and admins all leads. Missing or inaccessible leads return 404; invalid actor
roles return 403 and missing or invalid tokens return 401.

The response is `{ "history": [...] }`. Each entry contains `id`, `leadId`,
`actorId`, `fromStatus`, `toStatus` and `createdAt` (an ISO 8601 timestamp).
Statuses use lowercase values. Entries are ordered newest first, with ID as a
stable tiebreaker. Pagination follows the leads list: `limit` defaults to 100
(1–100), and `offset` defaults to 0 (0–100000). Invalid pagination returns 400.
An empty page returns 200 with an empty array. Responses use `Cache-Control:
no-store`.
