-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "defaultCurrency" TEXT DEFAULT 'USD',
ADD COLUMN     "paymentMethods" JSONB,
ADD COLUMN     "policies" TEXT;

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "customCurrency" TEXT,
ADD COLUMN     "customPaymentMethods" JSONB,
ADD COLUMN     "customPolicies" TEXT;
