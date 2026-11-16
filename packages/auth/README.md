# Authentication workstream

This package owns authentication and authorization contracts.

## TDD starting scenarios

- An unauthenticated principal cannot access broker-only data.
- A broker can see only leads assigned to their permitted team.
- An administrator can manage users but cannot bypass audit logging.
- An expired session is rejected.
- Password reset tokens expire and may be used only once.

Implement tests first. Avoid hardcoded secrets, insecure browser storage or development-only sessions enabled in production.

## Initial roles

- `admin`: user and team administration
- `broker`: leads and quotations assigned to the broker
- `manager`: authorized oversight of a team
