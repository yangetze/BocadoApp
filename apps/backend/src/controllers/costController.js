import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';

export const calculateSuperRecipeCost = async (req, res) => {
  try {
    const { superRecipeId } = req.params;
    const { yield: yieldParam } = req.query;
    const userId = req.user.id;

    // Multiplier defaults to 1 if no custom yield is provided
    const scaleMultiplier = yieldParam ? parseFloat(yieldParam) : 1;

    if (isNaN(scaleMultiplier) || scaleMultiplier <= 0) {
      return res.status(400).json({ error: 'Invalid yield parameter' });
    }

    let superRecipe;
    let exchangeRates;

    if (isTestMode()) {
      superRecipe = mockData.superRecipes.find(sr => sr.id === superRecipeId && sr.userId === userId);

      // Filter exchange rates to get the latest distinct ones per currency
      const latestRates = new Map();
      for (const rate of mockData.exchangeRates) {
        const existing = latestRates.get(rate.targetCurrencyId);
        if (!existing || rate.effectiveDate > existing.effectiveDate) {
          latestRates.set(rate.targetCurrencyId, rate);
        }
      }
      exchangeRates = Array.from(latestRates.values());
    } else {
      // Fetch SuperRecipe with deeply nested base recipes and ingredients
      superRecipe = await prisma.superRecipe.findUnique({
        where: { id: superRecipeId },
        include: {
          baseRecipes: {
            include: {
              baseRecipe: {
                include: {
                  ingredients: {
                    include: {
                      ingredient: true
                    }
                  }
                }
              }
            }
          },
          directIngredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    }

    if (!superRecipe || (!isTestMode() && superRecipe.userId !== userId)) {
      return res.status(404).json({ error: 'SuperRecipe not found' });
    }

    let totalBaseCost = 0;
    const breakdown = {
      baseRecipes: [],
      directIngredients: []
    };

    // Cache for base recipe calculations to avoid redundant nested ingredient loops
    const baseRecipeCache = new Map();

    // 1. Calculate cost from nested Base Recipes
    for (const srBaseRecipe of superRecipe.baseRecipes) {
      const { quantityNeeded, baseRecipe } = srBaseRecipe;

      let cachedData = baseRecipeCache.get(baseRecipe.id);

      if (!cachedData) {
        let baseRecipeCostPerUnit = 0;
        // Calculate the cost of the base recipe based on its ingredients
        const baseRecipeIngredientsBreakdown = [];
        for (const brIngredient of baseRecipe.ingredients) {
          const { quantity, ingredient } = brIngredient;
          // Cost of this ingredient for the base recipe's default yield
          const cost = quantity * (ingredient.globalPrice / (ingredient.globalPriceQuantity || 1));
          baseRecipeCostPerUnit += cost;

          baseRecipeIngredientsBreakdown.push({
            ingredientName: ingredient.name,
            quantityUsed: quantity,
            cost
          });
        }
        cachedData = { baseRecipeCostPerUnit, baseRecipeIngredientsBreakdown };
        baseRecipeCache.set(baseRecipe.id, cachedData);
      }

      const { baseRecipeCostPerUnit, baseRecipeIngredientsBreakdown } = cachedData;

      // Pro-rate the cost based on how much of this base recipe is needed for the super recipe
      const costForSuperRecipe = (quantityNeeded / baseRecipe.baseYield) * baseRecipeCostPerUnit;

      // Apply the scale multiplier
      const finalCost = costForSuperRecipe * scaleMultiplier;
      totalBaseCost += finalCost;

      breakdown.baseRecipes.push({
        baseRecipeName: baseRecipe.name,
        quantityNeeded: quantityNeeded * scaleMultiplier,
        cost: finalCost,
        ingredients: baseRecipeIngredientsBreakdown
      });
    }

    // 2. Calculate cost from Direct Ingredients (e.g. Box, Cake board)
    for (const srDirectIngredient of superRecipe.directIngredients) {
      const { quantityNeeded, ingredient } = srDirectIngredient;
      const finalCost = quantityNeeded * (ingredient.globalPrice / (ingredient.globalPriceQuantity || 1)) * scaleMultiplier;
      totalBaseCost += finalCost;

      breakdown.directIngredients.push({
        ingredientName: ingredient.name,
        quantityNeeded: quantityNeeded * scaleMultiplier,
        cost: finalCost
      });
    }

    if (!isTestMode()) {
      // Fetch exchange rates (USD to local currencies, assuming base currency is USD)
      exchangeRates = await prisma.exchangeRate.findMany({
        include: { targetCurrency: true },
        orderBy: { effectiveDate: 'desc' },
        distinct: ['targetCurrencyId'] // Get latest rate per currency
      });
    }

    const costsInOtherCurrencies = exchangeRates.map(rate => ({
      currency: rate.targetCurrency.code,
      symbol: rate.targetCurrency.symbol,
      cost: totalBaseCost * rate.rate
    }));

    return res.status(200).json({
      superRecipeName: superRecipe.name,
      scaleMultiplier,
      costs: {
        baseCurrency: 'USD',
        baseCost: totalBaseCost,
        convertedCosts: costsInOtherCurrencies
      },
      breakdown
    });

  } catch (error) {
    console.error('Error calculating cost:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
