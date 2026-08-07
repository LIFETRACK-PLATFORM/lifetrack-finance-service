-- CreateEnum
CREATE TYPE "RecurringMode" AS ENUM ('AUTO', 'REMIND');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "recurringItemId" TEXT;

-- CreateTable
CREATE TABLE "RecurringItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "kind" "TransactionKind" NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "mode" "RecurringMode" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastGeneratedMonth" INTEGER,
    "lastGeneratedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringItem_userId_idx" ON "RecurringItem"("userId");

-- CreateIndex
CREATE INDEX "RecurringItem_userId_active_idx" ON "RecurringItem"("userId", "active");

-- CreateIndex
CREATE INDEX "Transaction_recurringItemId_occurredAt_idx" ON "Transaction"("recurringItemId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurringItemId_fkey" FOREIGN KEY ("recurringItemId") REFERENCES "RecurringItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringItem" ADD CONSTRAINT "RecurringItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringItem" ADD CONSTRAINT "RecurringItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
