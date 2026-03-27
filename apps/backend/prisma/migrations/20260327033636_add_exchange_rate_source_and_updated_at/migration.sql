-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ExchangeRateSource" AS ENUM ('MANUAL', 'CRIPTOYA_BCV', 'CRIPTOYA_PARALELO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "globalCost" DOUBLE PRECISION NOT NULL,
    "measurementUnit" TEXT NOT NULL,
    "brand" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseRecipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseYield" DOUBLE PRECISION NOT NULL,
    "yieldUnit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BaseRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseRecipeIngredient" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "baseRecipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,

    CONSTRAINT "BaseRecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperRecipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SuperRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperRecipeBaseRecipe" (
    "id" TEXT NOT NULL,
    "quantityNeeded" DOUBLE PRECISION NOT NULL,
    "superRecipeId" TEXT NOT NULL,
    "baseRecipeId" TEXT NOT NULL,

    CONSTRAINT "SuperRecipeBaseRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperRecipeDirectIngredient" (
    "id" TEXT NOT NULL,
    "quantityNeeded" DOUBLE PRECISION NOT NULL,
    "superRecipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,

    CONSTRAINT "SuperRecipeDirectIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "customerName" TEXT,
    "scaleQuantity" DOUBLE PRECISION NOT NULL,
    "profitMargin" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "superRecipeId" TEXT NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" "ExchangeRateSource" NOT NULL DEFAULT 'MANUAL',
    "targetCurrencyId" TEXT NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BaseRecipeIngredient_baseRecipeId_ingredientId_key" ON "BaseRecipeIngredient"("baseRecipeId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperRecipeBaseRecipe_superRecipeId_baseRecipeId_key" ON "SuperRecipeBaseRecipe"("superRecipeId", "baseRecipeId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperRecipeDirectIngredient_superRecipeId_ingredientId_key" ON "SuperRecipeDirectIngredient"("superRecipeId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_effectiveDate_targetCurrencyId_key" ON "ExchangeRate"("effectiveDate", "targetCurrencyId");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseRecipe" ADD CONSTRAINT "BaseRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseRecipeIngredient" ADD CONSTRAINT "BaseRecipeIngredient_baseRecipeId_fkey" FOREIGN KEY ("baseRecipeId") REFERENCES "BaseRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseRecipeIngredient" ADD CONSTRAINT "BaseRecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperRecipe" ADD CONSTRAINT "SuperRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperRecipeBaseRecipe" ADD CONSTRAINT "SuperRecipeBaseRecipe_superRecipeId_fkey" FOREIGN KEY ("superRecipeId") REFERENCES "SuperRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperRecipeBaseRecipe" ADD CONSTRAINT "SuperRecipeBaseRecipe_baseRecipeId_fkey" FOREIGN KEY ("baseRecipeId") REFERENCES "BaseRecipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperRecipeDirectIngredient" ADD CONSTRAINT "SuperRecipeDirectIngredient_superRecipeId_fkey" FOREIGN KEY ("superRecipeId") REFERENCES "SuperRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperRecipeDirectIngredient" ADD CONSTRAINT "SuperRecipeDirectIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_superRecipeId_fkey" FOREIGN KEY ("superRecipeId") REFERENCES "SuperRecipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_targetCurrencyId_fkey" FOREIGN KEY ("targetCurrencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
