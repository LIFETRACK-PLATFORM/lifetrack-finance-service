-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "installmentCount" INTEGER,
ADD COLUMN     "startingInstallment" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "interestAmount" DOUBLE PRECISION;
