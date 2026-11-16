# Notification worker recovery

Backlog-ID: notifications--task-12

Call `recoverStaleNotificationJobs` on worker startup and periodically to requeue expired PROCESSING jobs. The worker uses a bounded lease; retry is **at least once**, not exactly once. Providers must support the existing idempotency key to avoid duplicate delivery after an uncertain send. Monitor DEAD_LETTER and avoid logging message bodies.

No real provider or production schedule is configured by this change.
