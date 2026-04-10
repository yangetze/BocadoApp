ALTER TABLE "Ingredient" RENAME COLUMN "globalCost" TO "globalPrice";
ALTER TABLE "Ingredient" ADD COLUMN "globalPriceQuantity" DOUBLE PRECISION NOT NULL DEFAULT 1;
