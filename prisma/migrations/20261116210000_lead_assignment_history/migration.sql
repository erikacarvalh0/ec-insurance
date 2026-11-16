CREATE TABLE "LeadAssignmentHistory" (
 "id" TEXT NOT NULL,
 "leadId" TEXT NOT NULL,
 "actorId" TEXT NOT NULL,
 "fromOwnerId" TEXT,
 "toOwnerId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "LeadAssignmentHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeadAssignmentHistory_leadId_createdAt_idx" ON "LeadAssignmentHistory"("leadId","createdAt");
ALTER TABLE "LeadAssignmentHistory" ADD CONSTRAINT "LeadAssignmentHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
