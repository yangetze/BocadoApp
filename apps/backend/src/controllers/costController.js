import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';

export const calculateSuperRecipeCost = async (req, res) => {
  try {
    const { superRecipeId } = req.params;
    const { yield: yieldParam } = req.query;

    // Multiplier defaults to 1 if no custom yield is provided
    const scaleMultiplier = yieldParam ? parseFloat(yieldParam) : 1;

    if (isNaN(scaleMultiplier) || scaleMultiplier <= 0) {
      return res.status(400).json({ error: 'Invalid yield parameter' });
    }

    let superRecipe;
    let exchangeRates;

    if (isTestMode()) {
      superRecipe = mockData.superRecipes.find(sr => sr.id === superRecipeId);

      // Filter exchange rates to get the latest distinct ones per currency
      const sortedRates = [...mockData.exchangeRates].sort((a, b) => b.effectiveDate - a.effectiveDate);
      exchangeRates = [];
      const seenCurrencies = new Set();
      for (const rate of sortedRates) {
        if (!seenCurrencies.has(rate.targetCurrencyId)) {
          exchangeRates.push(rate);
          seenCurrencies.add(rate.targetCurrencyId);
        }
      }
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

    if (!superRecipe) {
      return res.status(404).json({ error: 'SuperRecipe not found' });
    }

    let totalBaseCost = 0;
    const breakdown = {
      baseRecipes: [],
      directIngredients: []
    };

    // 1. Calculate cost from nested Base Recipes
    for (const srBaseRecipe of superRecipe.baseRecipes) {
      const { quantityNeeded, baseRecipe } = srBaseRecipe;
      let baseRecipeCostPerUnit = 0;

      // Calculate the cost of the base recipe based on its ingredients
      const baseRecipeIngredientsBreakdown = [];
      for (const brIngredient of baseRecipe.ingredients) {
        const { quantity, ingredient } = brIngredient;
        // Cost of this ingredient for the base recipe's default yield
        const cost = quantity * ingredient.globalCost;
        baseRecipeCostPerUnit += cost;

        baseRecipeIngredientsBreakdown.push({
          ingredientName: ingredient.name,
          quantityUsed: quantity,
          cost
        });
      }

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
      const finalCost = quantityNeeded * ingredient.globalCost * scaleMultiplier;
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
