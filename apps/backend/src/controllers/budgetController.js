import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';

export const createBudget = async (req, res) => {
  try {
    const { customerName, profitMargin, userId, superRecipes } = req.body;

    if (!userId || !superRecipes || !Array.isArray(superRecipes) || superRecipes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or invalid superRecipes array' });
    }

    if (isTestMode()) {
      const newBudget = {
        id: `bud-${Date.now()}`,
        customerName: customerName || null,
        profitMargin: parseFloat(profitMargin),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        superRecipes: superRecipes.map(sr => ({
          id: `bsr-${Date.now()}-${Math.random()}`,
          budgetId: `bud-${Date.now()}`,
          superRecipeId: sr.superRecipeId,
          scaleQuantity: sr.scaleQuantity || 1,
          superRecipe: mockData.superRecipes.find(s => s.id === sr.superRecipeId)
        }))
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
        }
      },
      include: {
        superRecipes: true
      }
    });

    return res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const { userId } = req.query;

    if (isTestMode()) {
      let result = mockData.budgets;
      if (userId) {
        result = result.filter(b => b.userId === userId);
      }
      return res.status(200).json(result.sort((a, b) => b.createdAt - a.createdAt));
    }

    const whereClause = userId ? { userId } : {};

    const budgets = await prisma.budget.findMany({
      where: whereClause,
      include: {
        superRecipes: {
          include: {
            superRecipe: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
