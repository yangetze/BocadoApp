UPDATE "Ingredient" SET "measurementUnit" = 'gr' WHERE "measurementUnit" = 'g';
UPDATE "Ingredient" SET "measurementUnit" = 'u' WHERE "measurementUnit" = 'unit';
UPDATE "Ingredient" SET "measurementUnit" = 'kg' WHERE "measurementUnit" = 'Kg';
UPDATE "Ingredient" SET "measurementUnit" = 'l' WHERE "measurementUnit" = 'L';
UPDATE "BaseRecipe" SET "yieldUnit" = 'gr' WHERE "yieldUnit" = 'g';
UPDATE "BaseRecipe" SET "yieldUnit" = 'u' WHERE "yieldUnit" = 'unit';
