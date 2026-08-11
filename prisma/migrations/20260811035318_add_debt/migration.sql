-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('CREDIT_CARD', 'LOAN', 'OTHER');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('ACTIVE', 'PAID_OFF', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "debtId" TEXT;

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lender" TEXT,
    "type" "DebtType" NOT NULL DEFAULT 'OTHER',
    "currency" TEXT NOT NULL,
    "totalOwed" DOUBLE PRECISION NOT NULL,
    "originalAmount" DOUBLE PRECISION,
    "minimumPayment" DOUBLE PRECISION,
    "dueDay" INTEGER,
    "accountId" TEXT,
    "categoryId" TEXT NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastPaymentMonth" INTEGER,
    "lastPaymentYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Debt_userId_idx" ON "Debt"("userId");

-- CreateIndex
CREATE INDEX "Debt_userId_status_idx" ON "Debt"("userId", "status");

-- CreateIndex
CREATE INDEX "Transaction_debtId_occurredAt_idx" ON "Transaction"("debtId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
