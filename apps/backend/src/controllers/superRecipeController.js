import prisma from '../prisma.js';
import logger from '../utils/logger.js';

export const getSuperRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const superRecipes = await prisma.superRecipe.findMany({
      where: { userId },
      include: {
        baseRecipes: {
          include: {
            baseRecipe: {
              include: {
                ingredients: {
                  include: { ingredient: { include: { presentations: true } } }
                }
              }
            }
          }
        },
        directIngredients: {
          include: { ingredient: { include: { presentations: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(superRecipes);
  } catch (error) {
    logger.error('Error fetching super recipes:', error.message);
    res.status(500).json({ error: 'Error al obtener las súper recetas' });
  }
};

export const createSuperRecipe = async (req, res) => {
  try {
    const { name, description, baseRecipes, directIngredients } = req.body;
    const userId = req.user.id;

    // Security: Verify ownership of baseRecipes and directIngredients before linking
    // ⚡ Bolt: Consolidated mapping into single loops and batched DB validations with Promise.all to prevent sequential I/O bottlenecks.
    const baseRecipeIdsSet = new Set();
    if (baseRecipes) {
      for (let i = 0; i < baseRecipes.length; i++) {
        baseRecipeIdsSet.add(baseRecipes[i].baseRecipeId);
      }
    }
    const baseRecipeIds = [...baseRecipeIdsSet];

    const ingredientIdsSet = new Set();
    if (directIngredients) {
      for (let i = 0; i < directIngredients.length; i++) {
        ingredientIdsSet.add(directIngredients[i].ingredientId);
      }
    }
    const ingredientIds = [...ingredientIdsSet];

    const promises = [];
    let baseRecipeCountIndex = -1;
    let ingredientCountIndex = -1;

    if (baseRecipeIds.length > 0) {
      baseRecipeCountIndex = promises.length;
      promises.push(
        prisma.baseRecipe.count({
          where: { id: { in: baseRecipeIds }, userId: userId }
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

    const results = await Promise.all(promises);

    if (baseRecipeCountIndex !== -1) {
      if (results[baseRecipeCountIndex] !== baseRecipeIds.length) {
        return res.status(404).json({ error: 'Una o más recetas base no fueron encontradas o no tienes permiso' });
      }
    }

    if (ingredientCountIndex !== -1) {
      if (results[ingredientCountIndex] !== ingredientIds.length) {
        return res.status(404).json({ error: 'Uno o más ingredientes no fueron encontrados o no tienes permiso' });
      }
    }

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
        baseRecipes: {
          include: {
            baseRecipe: {
              include: {
                ingredients: {
                  include: { ingredient: { include: { presentations: true } } }
                }
              }
            }
          }
        },
        directIngredients: { include: { ingredient: { include: { presentations: true } } } }
      }
    });

    res.status(201).json(newSuperRecipe);
  } catch (error) {
    logger.error('Error creating super recipe:', error.message);
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
    // ⚡ Bolt: Consolidated mapping into single loops and batched DB validations with Promise.all to prevent sequential I/O bottlenecks.
    const baseRecipeIdsSet = new Set();
    if (baseRecipes) {
      for (let i = 0; i < baseRecipes.length; i++) {
        baseRecipeIdsSet.add(baseRecipes[i].baseRecipeId);
      }
    }
    const baseRecipeIds = [...baseRecipeIdsSet];

    const ingredientIdsSet = new Set();
    if (directIngredients) {
      for (let i = 0; i < directIngredients.length; i++) {
        ingredientIdsSet.add(directIngredients[i].ingredientId);
      }
    }
    const ingredientIds = [...ingredientIdsSet];

    const promises = [];
    let baseRecipeCountIndex = -1;
    let ingredientCountIndex = -1;

    if (baseRecipeIds.length > 0) {
      baseRecipeCountIndex = promises.length;
      promises.push(
        prisma.baseRecipe.count({
          where: { id: { in: baseRecipeIds }, userId: req.user.id }
        })
      );
    }

    if (ingredientIds.length > 0) {
      ingredientCountIndex = promises.length;
      promises.push(
        prisma.ingredient.count({
          where: { id: { in: ingredientIds }, userId: req.user.id }
        })
      );
    }

    const results = await Promise.all(promises);

    if (baseRecipeCountIndex !== -1) {
      if (results[baseRecipeCountIndex] !== baseRecipeIds.length) {
        return res.status(404).json({ error: 'Una o más recetas base no fueron encontradas o no tienes permiso' });
      }
    }

    if (ingredientCountIndex !== -1) {
      if (results[ingredientCountIndex] !== ingredientIds.length) {
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
          baseRecipes: {
            include: {
              baseRecipe: {
                include: {
                  ingredients: {
                    include: { ingredient: { include: { presentations: true } } }
                  }
                }
              }
            }
          },
          directIngredients: { include: { ingredient: { include: { presentations: true } } } }
        }
      });
    });

    res.status(200).json(updated);
  } catch (error) {
    logger.error('Error updating super recipe:', error.message);
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
    logger.error('Error deleting super recipe:', error.message);
    res.status(500).json({ error: 'Error al eliminar la súper receta' });
  }
};
