-- AlterTable
ALTER TABLE "User" ADD COLUMN "defaultCurrency" TEXT;
ALTER TABLE "User" ADD COLUMN "companyLogo" TEXT;
ALTER TABLE "User" ADD COLUMN "policies" TEXT;
ALTER TABLE "User" ADD COLUMN "paymentMethods" JSONB;
