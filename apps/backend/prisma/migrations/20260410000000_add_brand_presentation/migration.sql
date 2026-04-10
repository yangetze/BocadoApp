-- CreateTable
CREATE TABLE "BrandPresentation" (
    "id" TEXT NOT NULL,
    "brand" TEXT,
    "presentationName" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "unitQuantity" DOUBLE PRECISION NOT NULL,
    "measurementUnit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ingredientId" TEXT NOT NULL,

    CONSTRAINT "BrandPresentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetBrandSelection" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "brandPresentationId" TEXT NOT NULL,

    CONSTRAINT "BudgetBrandSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ingredient_userId_createdAt_idx" ON "Ingredient"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BaseRecipe_userId_createdAt_idx" ON "BaseRecipe"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SuperRecipe_userId_createdAt_idx" ON "SuperRecipe"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Budget_userId_createdAt_idx" ON "Budget"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "BudgetBrandSelection_budgetId_ingredientId_key" ON "BudgetBrandSelection"("budgetId", "ingredientId");

-- AddForeignKey
ALTER TABLE "BrandPresentation" ADD CONSTRAINT "BrandPresentation_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetBrandSelection" ADD CONSTRAINT "BudgetBrandSelection_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetBrandSelection" ADD CONSTRAINT "BudgetBrandSelection_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetBrandSelection" ADD CONSTRAINT "BudgetBrandSelection_brandPresentationId_fkey" FOREIGN KEY ("brandPresentationId") REFERENCES "BrandPresentation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
