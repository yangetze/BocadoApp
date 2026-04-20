import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';
import logger from '../utils/logger.js';

export const recommendMargin = async (req, res) => {
  try {
    const { superRecipeId } = req.params;
    const userId = req.user.id;

    let superRecipe;

    if (isTestMode()) {
      superRecipe = mockData.superRecipes.find(sr => sr.id === superRecipeId && sr.userId === userId);
    } else {
      superRecipe = await prisma.superRecipe.findUnique({
        where: { id: superRecipeId },
        include: {
          baseRecipes: {
            include: {
              baseRecipe: {
                include: {
                  ingredients: true
                }
              }
            }
          },
          directIngredients: true
        }
      });
    }

    if (!superRecipe || (!isTestMode() && superRecipe.userId !== userId)) {
      return res.status(404).json({ error: 'SuperRecipe not found' });
    }

    // Calcular la complejidad
    let complexityScore = 0;

    complexityScore += superRecipe.directIngredients ? superRecipe.directIngredients.length : 0;

    if (superRecipe.baseRecipes) {
      const baseRecipesLen = superRecipe.baseRecipes.length;
      for (let i = 0; i < baseRecipesLen; i++) {
        const srBaseRecipe = superRecipe.baseRecipes[i];
        complexityScore += 2;
        if (srBaseRecipe.baseRecipe && srBaseRecipe.baseRecipe.ingredients) {
          complexityScore += srBaseRecipe.baseRecipe.ingredients.length;
        }
      }
    }

    // Regla de negocio simple para el margen sugerido
    let suggestedMargin = 0.30; // 30% base
    let complexityLevel = 'Baja';

    if (complexityScore > 20) {
      suggestedMargin = 0.50; // 50% para alta complejidad
      complexityLevel = 'Alta';
    } else if (complexityScore > 10) {
      suggestedMargin = 0.40; // 40% para complejidad media
      complexityLevel = 'Media';
    }

    return res.status(200).json({
      superRecipeId: superRecipe.id,
      complexityScore,
      complexityLevel,
      suggestedMargin
    });

  } catch (error) {
    logger.error('Error recommending margin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
