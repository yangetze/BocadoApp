import prisma from '../prisma.js';

export const getSuperRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const superRecipes = await prisma.superRecipe.findMany({
      where: { userId },
      include: {
        baseRecipes: {
          include: { baseRecipe: true }
        },
        directIngredients: {
          include: { ingredient: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(superRecipes);
  } catch (error) {
    console.error('Error fetching super recipes:', error);
    res.status(500).json({ error: 'Error al obtener las súper recetas' });
  }
};

export const createSuperRecipe = async (req, res) => {
  try {
    const { name, description, baseRecipes, directIngredients } = req.body;
    const userId = req.user.id;

    const newSuperRecipe = await prisma.superRecipe.create({
      data: {
        name,
        description,
        userId: userId,
        baseRecipes: {
          create: baseRecipes?.map(br => ({
            quantityNeeded: parseFloat(br.quantityNeeded),
            baseRecipeId: br.baseRecipeId
          })) || []
        },
        directIngredients: {
          create: directIngredients?.map(di => ({
            quantityNeeded: parseFloat(di.quantityNeeded),
            ingredientId: di.ingredientId
          })) || []
        }
      },
      include: {
        baseRecipes: { include: { baseRecipe: true } },
        directIngredients: { include: { ingredient: true } }
      }
    });

    res.status(201).json(newSuperRecipe);
  } catch (error) {
    console.error('Error creating super recipe:', error);
    res.status(500).json({ error: 'Error al crear la súper receta' });
  }
};

export const updateSuperRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, baseRecipes, directIngredients } = req.body;

    // Security: Verify ownership before executing transaction to prevent unauthorized nested operations (IDOR)
    const existingSuperRecipe = await prisma.superRecipe.findUnique({
      where: { id }
    });


    if (!existingSuperRecipe || existingSuperRecipe.userId !== req.user.id) {
      return res.status(404).json({ error: 'Súper receta no encontrada o no tienes permiso para actualizarla' });
    }

    // Security: Verify ownership of baseRecipes and directIngredients before linking
    if (baseRecipes && baseRecipes.length > 0) {
      const baseRecipeIds = [...new Set(baseRecipes.map(br => br.baseRecipeId))];
      const validBaseRecipesCount = await prisma.baseRecipe.count({
        where: {
          id: { in: baseRecipeIds },
          userId: req.user.id
        }
      });
      if (validBaseRecipesCount !== baseRecipeIds.length) {
        return res.status(404).json({ error: 'Una o más recetas base no fueron encontradas o no tienes permiso' });
      }
    }

    if (directIngredients && directIngredients.length > 0) {
      const ingredientIds = [...new Set(directIngredients.map(di => di.ingredientId))];
      const validIngredientsCount = await prisma.ingredient.count({
        where: {
          id: { in: ingredientIds },
          userId: req.user.id
        }
      });
      if (validIngredientsCount !== ingredientIds.length) {
        return res.status(404).json({ error: 'Uno o más ingredientes no fueron encontrados o no tienes permiso' });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Basic update
      await tx.superRecipe.update({
        where: { id },
        data: { name, description }
      });

      // Update base recipes junction
      if (baseRecipes) {
        await tx.superRecipeBaseRecipe.deleteMany({ where: { superRecipeId: id } });
        if (baseRecipes.length > 0) {
          await tx.superRecipeBaseRecipe.createMany({
            data: baseRecipes.map(br => ({
              superRecipeId: id,
              baseRecipeId: br.baseRecipeId,
              quantityNeeded: parseFloat(br.quantityNeeded)
            }))
          });
        }
      }

      // Update direct ingredients junction
      if (directIngredients) {
        await tx.superRecipeDirectIngredient.deleteMany({ where: { superRecipeId: id } });
        if (directIngredients.length > 0) {
          await tx.superRecipeDirectIngredient.createMany({
            data: directIngredients.map(di => ({
              superRecipeId: id,
              ingredientId: di.ingredientId,
              quantityNeeded: parseFloat(di.quantityNeeded)
            }))
          });
        }
      }

      return tx.superRecipe.findUnique({
        where: { id },
        include: {
          baseRecipes: { include: { baseRecipe: true } },
          directIngredients: { include: { ingredient: true } }
        }
      });
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating super recipe:', error);
    res.status(500).json({ error: 'Error al actualizar la súper receta' });
  }
};

export const deleteSuperRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Security: Verify ownership before deleting (IDOR)
    const existingSuperRecipe = await prisma.superRecipe.findUnique({
      where: { id }
    });

    if (!existingSuperRecipe || existingSuperRecipe.userId !== req.user.id) {
      return res.status(404).json({ error: 'Súper receta no encontrada o no tienes permiso para eliminarla' });
    }

    // Check if used in budgets
    const usedInBudget = await prisma.budgetSuperRecipe.findFirst({ where: { superRecipeId: id } });
    if (usedInBudget) {
      return res.status(400).json({ error: 'No se puede eliminar la súper receta porque está en uso en un presupuesto.' });
    }

    await prisma.superRecipe.delete({ 
      where: { id }
    });
    res.status(200).json({ message: 'Súper receta eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting super recipe:', error);
    res.status(500).json({ error: 'Error al eliminar la súper receta' });
  }
};
