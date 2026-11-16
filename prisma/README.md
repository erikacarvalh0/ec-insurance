# Persistence schema

This directory contains the initial Prisma model for insurance leads and quotations.

## Verification before merge

1. Configure a non-production PostgreSQL instance and `DATABASE_URL`.
2. Install the Prisma CLI and client at a compatible pinned version.
3. Run `prisma validate` to verify schema compatibility.
4. Review the generated SQL migration before applying it.
5. Add repository integration tests for uniqueness, lead relations, and deletion behavior.

The schema is an initial proposal. It does not yet include encryption, user accounts, team relations, audit trails, or migrations. Do not store real customer records until security and LGPD requirements have been reviewed.
