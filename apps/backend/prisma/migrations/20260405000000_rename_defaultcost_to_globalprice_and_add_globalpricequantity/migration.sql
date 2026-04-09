ALTER TABLE "Ingredient" RENAME COLUMN "defaultCost" TO "globalPrice";
ALTER TABLE "Ingredient" ADD COLUMN "globalPriceQuantity" DOUBLE PRECISION NOT NULL DEFAULT 1;
