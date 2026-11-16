-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('AUTO', 'RESIDENTIAL', 'LIFE', 'HEALTH', 'BUSINESS', 'TRAVEL');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'QUOTED', 'MANUAL_REVIEW', 'CONTACTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "insuranceType" "InsuranceType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'RECEIVED',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "ownerId" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_idempotencyKey_key" ON "Lead"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_teamId_ownerId_idx" ON "Lead"("teamId", "ownerId");

-- CreateIndex
CREATE INDEX "Quotation_leadId_createdAt_idx" ON "Quotation"("leadId", "createdAt");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
