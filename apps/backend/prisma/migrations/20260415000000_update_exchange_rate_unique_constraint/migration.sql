-- DropIndex
DROP INDEX "ExchangeRate_effectiveDate_targetCurrencyId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_effectiveDate_targetCurrencyId_source_key" ON "ExchangeRate"("effectiveDate", "targetCurrencyId", "source");
