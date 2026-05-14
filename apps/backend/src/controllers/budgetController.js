import crypto from 'node:crypto';
import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';
import logger from '../utils/logger.js';

export const createBudget = async (req, res) => {
  try {
    const { customerName, profitMargin, superRecipes, brandSelections, customCurrency, customPolicies, customPaymentMethods } = req.body;
    const userId = req.user.id;

    if (!superRecipes || !Array.isArray(superRecipes) || superRecipes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or invalid superRecipes array' });
    }

    if (!isTestMode()) {
      // ⚡ Bolt: Consolidated mapping into single loops and batched DB validations with Promise.all to prevent sequential I/O bottlenecks.
      const superRecipeIdsSet = new Set();
      if (superRecipes) {
        for (let i = 0; i < superRecipes.length; i++) {
          superRecipeIdsSet.add(superRecipes[i].superRecipeId);
        }
      }
      const superRecipeIds = [...superRecipeIdsSet];

      const ingredientIdsSet = new Set();
      const brandPresentationIdsSet = new Set();
      if (brandSelections) {
        for (let i = 0; i < brandSelections.length; i++) {
          ingredientIdsSet.add(brandSelections[i].ingredientId);
          brandPresentationIdsSet.add(brandSelections[i].brandPresentationId);
        }
      }
      const ingredientIds = [...ingredientIdsSet];
      const brandPresentationIds = [...brandPresentationIdsSet];

      const promises = [];

      let superRecipeCountIndex = -1;
      let ingredientCountIndex = -1;
      let brandPresentationFindIndex = -1;

      if (superRecipeIds.length > 0) {
        superRecipeCountIndex = promises.length;
        promises.push(
          prisma.superRecipe.count({
            where: { id: { in: superRecipeIds }, userId: userId }
          })
        );
      }

      if (ingredientIds.length > 0) {
        ingredientCountIndex = promises.length;
        promises.push(
          prisma.ingredient.count({
            where: { id: { in: ingredientIds }, userId: userId }
          })
        );
      }

      if (brandPresentationIds.length > 0) {
        brandPresentationFindIndex = promises.length;
        promises.push(
          prisma.brandPresentation.findMany({
            where: {
              id: { in: brandPresentationIds },
              ingredient: { userId: userId }
            }
          })
        );
      }

      const results = await Promise.all(promises);

      if (superRecipeCountIndex !== -1) {
        if (results[superRecipeCountIndex] !== superRecipeIds.length) {
          return res.status(404).json({ error: 'Una o más súper recetas no fueron encontradas o no tienes permiso' });
        }
      }

      if (ingredientCountIndex !== -1) {
        if (results[ingredientCountIndex] !== ingredientIds.length) {
          return res.status(404).json({ error: 'Uno o más ingredientes no fueron encontrados o no tienes permiso' });
        }
      }

      if (brandPresentationFindIndex !== -1) {
        const brandPresentations = results[brandPresentationFindIndex];
        if (brandPresentations.length !== brandPresentationIds.length) {
          return res.status(404).json({ error: 'Una o más presentaciones de marca no fueron encontradas o no tienes permiso' });
        }

        const bpMap = new Map();
        for (let i = 0; i < brandPresentations.length; i++) {
          bpMap.set(brandPresentations[i].id, brandPresentations[i].ingredientId);
        }
        for (const bs of brandSelections) {
          if (bpMap.get(bs.brandPresentationId) !== bs.ingredientId) {
             return res.status(404).json({ error: 'La presentación de marca no corresponde al ingrediente especificado' });
          }
        }
      }
    }

    if (isTestMode()) {
      const budgetId = `bud-${crypto.randomUUID()}`;
      const superRecipeMap = new Map(mockData.superRecipes.map(s => [s.id, s]));
      const newBudget = {
        id: budgetId,
        customerName: customerName || null,
        profitMargin: parseFloat(profitMargin),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        superRecipes: superRecipes.map(sr => ({
          id: `bsr-${crypto.randomUUID()}`,
          budgetId,
          superRecipeId: sr.superRecipeId,
          scaleQuantity: sr.scaleQuantity || 1,
          superRecipe: superRecipeMap.get(sr.superRecipeId)
        })),
        brandSelections: brandSelections?.map(bs => ({
           id: `bbs-${crypto.randomUUID()}`,
           budgetId,
           ingredientId: bs.ingredientId,
           brandPresentationId: bs.brandPresentationId
        })) || []
      };
      mockData.budgets.push(newBudget);
      return res.status(201).json(newBudget);
    }

    const budget = await prisma.budget.create({
      data: {
        customerName,
        profitMargin,
        userId,
        superRecipes: {
          create: superRecipes.map(sr => ({
            superRecipeId: sr.superRecipeId,
            scaleQuantity: sr.scaleQuantity || 1
          }))
        },
        brandSelections: {
          create: brandSelections?.map(bs => ({
            ingredientId: bs.ingredientId,
            brandPresentationId: bs.brandPresentationId
          })) || []
        }
      },
      include: {
        superRecipes: true,
        brandSelections: true
      }
    });

    return res.status(201).json(budget);
  } catch (error) {
    logger.error('Error creating budget:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;

    if (isTestMode()) {
      let result = mockData.budgets.filter(b => b.userId === userId);
      return res.status(200).json(result.sort((a, b) => b.createdAt - a.createdAt));
    }

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        superRecipes: {
          include: {
            superRecipe: { include: { baseRecipes: { include: { baseRecipe: { include: { ingredients: { include: { ingredient: { include: { presentations: true } } } } } } } }, directIngredients: { include: { ingredient: { include: { presentations: true } } } } } }
          }
        },
        brandSelections: {
           include: {
              brandPresentation: true
           }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(budgets);
  } catch (error) {
    logger.error('Error fetching budgets:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isTestMode()) {
      const budget = mockData.budgets.find((b) => b.id === id && b.userId === userId);
      if (!budget) return res.status(404).json({ error: 'Budget not found' });
      return res.status(200).json(budget);
    }

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        superRecipes: {
          include: {
            superRecipe: { include: { baseRecipes: { include: { baseRecipe: { include: { ingredients: { include: { ingredient: { include: { presentations: true } } } } } } } }, directIngredients: { include: { ingredient: { include: { presentations: true } } } } } }
          }
        },
        brandSelections: {
           include: {
              brandPresentation: true
           }
        }
      }
    });

    if (!budget || budget.userId !== userId) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    return res.status(200).json(budget);
  } catch (error) {
    logger.error('Error fetching budget by id:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, profitMargin, superRecipes, brandSelections, customCurrency, customPolicies, customPaymentMethods } = req.body;
    const userId = req.user.id;

    // Verify ownership early to prevent IDOR (information leakage via dependency checks)
    if (!isTestMode()) {
      const existingBudget = await prisma.budget.findUnique({
        where: { id }
      });

      if (!existingBudget || existingBudget.userId !== userId) {
        return res.status(404).json({ error: 'Budget not found' });
      }
    }

    if (!superRecipes || !Array.isArray(superRecipes) || superRecipes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or invalid superRecipes array' });
    }

    if (!isTestMode()) {
      // ⚡ Bolt: Consolidated mapping into single loops and batched DB validations with Promise.all to prevent sequential I/O bottlenecks.
      const superRecipeIdsSet = new Set();
      if (superRecipes) {
        for (let i = 0; i < superRecipes.length; i++) {
          superRecipeIdsSet.add(superRecipes[i].superRecipeId);
        }
      }
      const superRecipeIds = [...superRecipeIdsSet];

      const ingredientIdsSet = new Set();
      const brandPresentationIdsSet = new Set();
      if (brandSelections) {
        for (let i = 0; i < brandSelections.length; i++) {
          ingredientIdsSet.add(brandSelections[i].ingredientId);
          brandPresentationIdsSet.add(brandSelections[i].brandPresentationId);
        }
      }
      const ingredientIds = [...ingredientIdsSet];
      const brandPresentationIds = [...brandPresentationIdsSet];

      const promises = [];

      let superRecipeCountIndex = -1;
      let ingredientCountIndex = -1;
      let brandPresentationFindIndex = -1;

      if (superRecipeIds.length > 0) {
        superRecipeCountIndex = promises.length;
        promises.push(
          prisma.superRecipe.count({
            where: { id: { in: superRecipeIds }, userId: userId }
          })
        );
      }

      if (ingredientIds.length > 0) {
        ingredientCountIndex = promises.length;
        promises.push(
          prisma.ingredient.count({
            where: { id: { in: ingredientIds }, userId: userId }
          })
        );
      }

      if (brandPresentationIds.length > 0) {
        brandPresentationFindIndex = promises.length;
        promises.push(
          prisma.brandPresentation.findMany({
            where: {
              id: { in: brandPresentationIds },
              ingredient: { userId: userId }
            }
          })
        );
      }

      const results = await Promise.all(promises);

      if (superRecipeCountIndex !== -1) {
        if (results[superRecipeCountIndex] !== superRecipeIds.length) {
          return res.status(404).json({ error: 'Una o más súper recetas no fueron encontradas o no tienes permiso' });
        }
      }

      if (ingredientCountIndex !== -1) {
        if (results[ingredientCountIndex] !== ingredientIds.length) {
          return res.status(404).json({ error: 'Uno o más ingredientes no fueron encontrados o no tienes permiso' });
        }
      }

      if (brandPresentationFindIndex !== -1) {
        const brandPresentations = results[brandPresentationFindIndex];
        if (brandPresentations.length !== brandPresentationIds.length) {
          return res.status(404).json({ error: 'Una o más presentaciones de marca no fueron encontradas o no tienes permiso' });
        }

        const bpMap = new Map();
        for (let i = 0; i < brandPresentations.length; i++) {
          bpMap.set(brandPresentations[i].id, brandPresentations[i].ingredientId);
        }
        for (const bs of brandSelections) {
          if (bpMap.get(bs.brandPresentationId) !== bs.ingredientId) {
             return res.status(404).json({ error: 'La presentación de marca no corresponde al ingrediente especificado' });
          }
        }
      }
    }

    if (isTestMode()) {
      const budgetIndex = mockData.budgets.findIndex((b) => b.id === id && b.userId === userId);
      if (budgetIndex === -1) return res.status(404).json({ error: 'Budget not found' });

      const superRecipeMap = new Map(mockData.superRecipes.map(s => [s.id, s]));
      const updatedBudget = {
        ...mockData.budgets[budgetIndex],
        customerName: customerName || null,
        profitMargin: parseFloat(profitMargin),
        updatedAt: new Date(),
        superRecipes: superRecipes.map((sr) => ({
          id: `bsr-${crypto.randomUUID()}`,
          budgetId: id,
          superRecipeId: sr.superRecipeId,
          scaleQuantity: sr.scaleQuantity || 1,
          superRecipe: superRecipeMap.get(sr.superRecipeId),
        })),
        brandSelections:
          brandSelections?.map((bs) => ({
            id: `bbs-${crypto.randomUUID()}`,
            budgetId: id,
            ingredientId: bs.ingredientId,
            brandPresentationId: bs.brandPresentationId,
          })) || [],
      };
      mockData.budgets[budgetIndex] = updatedBudget;
      return res.status(200).json(updatedBudget);
    }

    const budget = await prisma.$transaction(async (tx) => {
      // Delete old relations
      await tx.budgetSuperRecipe.deleteMany({ where: { budgetId: id } });
      await tx.budgetBrandSelection.deleteMany({ where: { budgetId: id } });

      // Create new relations
      return await tx.budget.update({
        where: { id },
        data: {
          customerName,
          profitMargin,
          superRecipes: {
            create: superRecipes.map((sr) => ({
              superRecipeId: sr.superRecipeId,
              scaleQuantity: sr.scaleQuantity || 1,
            })),
          },
          brandSelections: {
            create:
              brandSelections?.map((bs) => ({
                ingredientId: bs.ingredientId,
                brandPresentationId: bs.brandPresentationId,
              })) || [],
          },
        },
        include: {
          superRecipes: true,
          brandSelections: true,
        },
      });
    });

    return res.status(200).json(budget);
  } catch (error) {
    logger.error('Error updating budget:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isTestMode()) {
      const budgetIndex = mockData.budgets.findIndex((b) => b.id === id && b.userId === userId);
      if (budgetIndex === -1) return res.status(404).json({ error: 'Budget not found' });
      mockData.budgets.splice(budgetIndex, 1);
      return res.status(200).json({ message: 'Budget deleted successfully' });
    }

    const existingBudget = await prisma.budget.findUnique({
      where: { id }
    });

    if (!existingBudget || existingBudget.userId !== userId) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await prisma.budget.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    logger.error('Error deleting budget:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
