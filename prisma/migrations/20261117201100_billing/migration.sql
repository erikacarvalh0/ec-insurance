CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "amountCents" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Invoice_amount_nonnegative" CHECK ("amountCents" >= 0),
  CONSTRAINT "Invoice_currency_check" CHECK ("currency" = 'BRL'),
  CONSTRAINT "Invoice_status_check" CHECK ("status" IN ('OPEN', 'PAID', 'CANCELLED'))
);
CREATE UNIQUE INDEX "Invoice_idempotencyKey_key" ON "Invoice"("idempotencyKey");

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "amountCents" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_amount_nonnegative" CHECK ("amountCents" >= 0),
  CONSTRAINT "Payment_currency_check" CHECK ("currency" = 'BRL'),
  CONSTRAINT "Payment_status_check" CHECK ("status" IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

CREATE TABLE "BillingTransaction" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "amountCents" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingTransaction_amount_nonnegative" CHECK ("amountCents" >= 0),
  CONSTRAINT "BillingTransaction_currency_check" CHECK ("currency" = 'BRL'),
  CONSTRAINT "BillingTransaction_status_check" CHECK ("status" IN ('PENDING', 'SUCCEEDED', 'FAILED')),
  CONSTRAINT "BillingTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "BillingTransaction_idempotencyKey_key" ON "BillingTransaction"("idempotencyKey");
CREATE INDEX "BillingTransaction_paymentId_idx" ON "BillingTransaction"("paymentId");

