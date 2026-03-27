import prisma from '../prisma.js';

export const createBudget = async (req, res) => {
  try {
    const { customerName, profitMargin, userId, superRecipes } = req.body;

    if (!userId || !superRecipes || !Array.isArray(superRecipes) || superRecipes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or invalid superRecipes array' });
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
