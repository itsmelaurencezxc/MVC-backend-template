/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- CreateTable
CREATE TABLE "payout_period" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_record" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grossEarnings" DECIMAL(12,2) NOT NULL,
    "salary" DECIMAL(12,2) NOT NULL,
    "recmats" TEXT,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "payoutPeriodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earnings_log" (
    "id" TEXT NOT NULL,
    "salaryRecordId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "earnings_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "salary_record" ADD CONSTRAINT "salary_record_payoutPeriodId_fkey" FOREIGN KEY ("payoutPeriodId") REFERENCES "payout_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings_log" ADD CONSTRAINT "earnings_log_salaryRecordId_fkey" FOREIGN KEY ("salaryRecordId") REFERENCES "salary_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
