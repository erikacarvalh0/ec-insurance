ALTER TABLE "NotificationJob" ADD COLUMN "leaseExpiresAt" TIMESTAMP(3);
CREATE INDEX "NotificationJob_status_leaseExpiresAt_idx" ON "NotificationJob"("status","leaseExpiresAt");
