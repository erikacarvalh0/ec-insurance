# LeadStatusHistory migration runbook

Backlog-ID: infra-db--task-11

## Apply
1. Back up the database and verify restore access before maintenance.
2. Check the migration SQL and current schema against the target PostgreSQL version.
3. Run `npm run db:migrate` in a non-production environment first.
4. Verify the foreign key and both indexes, and confirm existing leads are unchanged.

## Recovery
This is an additive migration; prefer a forward fix rather than dropping audit records. If a rollback is explicitly approved **before any history records exist**, remove the FK, indexes and table in a maintenance window. Never run a destructive rollback after audit records have been written. Restore from a verified backup if integrity is compromised.

No migration has been applied to a live database by this PR.
