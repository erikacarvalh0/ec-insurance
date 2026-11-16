CREATE TABLE "NotificationJob" (
 "id" TEXT NOT NULL,
 "idempotencyKey" TEXT NOT NULL,
 "subject" TEXT NOT NULL,
 "body" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING',
 "attempts" INTEGER NOT NULL DEFAULT 0,
 "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "NotificationJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NotificationJob_idempotencyKey_key" ON "NotificationJob"("idempotencyKey");
CREATE INDEX "NotificationJob_status_nextAttemptAt_idx" ON "NotificationJob"("status","nextAttemptAt");
