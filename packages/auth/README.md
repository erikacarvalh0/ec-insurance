# Authentication workstream

This package owns authentication and authorization contracts.

## TDD starting scenarios

- An unauthenticated principal cannot access broker-only data.
- A broker can see only leads assigned to their permitted team.
- An administrator can manage users but cannot bypass audit logging.
- An expired session is rejected.
- Password reset tokens expire and may be used only once.

Implement tests first. Avoid hardcoded secrets, insecure browser storage or development-only sessions enabled in production.

## Password recovery

`createPasswordResetService` in `src/password-reset.mjs` provides `request({ email })`
and `reset({ token, password })`. Compose it with
`createPrismaPasswordResetRepository(prisma)` and an injected `deliver` function
that queues reset instructions to the account email. Apply the password reset
migration and regenerate the Prisma client before using the repository.

Tokens contain 32 random bytes; only SHA-256 digests are persisted. They expire
after 15 minutes by default. A new request replaces the previous token, and an
atomic conditional password update clears the token on successful use. Disabled
accounts cannot request or consume tokens. Passwords use the existing scrypt format.
Recovery responses are identical for missing/disabled accounts and delivery errors;
tokens are passed only to `deliver`, never returned in the recovery response.

This is a domain service, not an HTTP route or mail transport. When exposing it,
apply request throttling and queue delivery outside the HTTP response path to avoid
delivery latency revealing account existence. Existing signed sessions retain their
original expiry; this change invalidates reset tokens, not session tokens.

## Initial roles

- `admin`: user and team administration
- `broker`: leads and quotations assigned to the broker
- `manager`: authorized oversight of a team
