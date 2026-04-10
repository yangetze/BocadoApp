import crypto from 'node:crypto';
import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';

export const getBaseRecipes = async (req, res) => {
  const userId = req.user.id;
  
  if (isTestMode()) {
    return res.status(200).json(mockData.baseRecipes.filter(r => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt));
  }
  try {
    const baseRecipes = await prisma.baseRecipe.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: { ingredient: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(baseRecipes);
  } catch (error) {
    console.error('Error fetching base recipes:', error);
    res.status(500).json({ error: 'Error al obtener las recetas base' });
  }
};

export const createBaseRecipe = async (req, res) => {
  try {
    const { name, baseYield, yieldUnit, ingredients } = req.body;
    const userId = req.user.id;

    // Security: Verify ownership of ingredients before linking
    if (ingredients && ingredients.length > 0) {
      const ingredientIds = [...new Set(ingredients.map(i => i.ingredientId))];
      const validIngredientsCount = await prisma.ingredient.count({
        where: {
          id: { in: ingredientIds },
          userId: userId
        }
      });
      if (validIngredientsCount !== ingredientIds.length) {
        return res.status(404).json({ error: 'Uno o más ingredientes no fueron encontrados o no tienes permiso' });
      }
    }

    if (isTestMode()) {
      const newRecipe = {
        id: `br-${crypto.randomUUID()}`,
        name,
        baseYield: parseFloat(baseYield),
        yieldUnit,
        userId: userId,
        ingredients: ingredients.map(i => ({
          id: `bri-${crypto.randomUUID()}`,
          quantity: parseFloat(i.quantity),
          ingredientId: i.ingredientId,
          ingredient: mockData.ingredients.find(ing => ing.id === i.ingredientId)
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockData.baseRecipes.push(newRecipe);
      return res.status(201).json(newRecipe);
    }

    const newRecipe = await prisma.baseRecipe.create({
      data: {
        name,
        baseYield: parseFloat(baseYield),
        yieldUnit,
        userId: userId,
        ingredients: {
          create: ingredients.map(i => ({
            quantity: parseFloat(i.quantity),
            ingredientId: i.ingredientId
          }))
        }
      },
      include: {
        ingredients: {
          include: { ingredient: true }
        }
      }
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating base recipe:', error);
    res.status(500).json({ error: 'Error al crear la receta base' });
  }
};

export const updateBaseRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, baseYield, yieldUnit, items } = req.body;

    if (isTestMode()) {
      const recipeIndex = mockData.baseRecipes.findIndex(br => br.id === id);
      if (recipeIndex === -1) return res.status(404).json({ error: 'Receta base no encontrada' });

      if (mockData.baseRecipes[recipeIndex].userId !== req.user.id) {
        return res.status(404).json({ error: 'Receta base no encontrada' });
      }

      const updated = {
        ...mockData.baseRecipes[recipeIndex],
        ...(name && { name }),
        ...(baseYield !== undefined && { baseYield: parseFloat(baseYield) }),
        ...(yieldUnit && { yieldUnit })
      };

      if (items) {
        updated.ingredients = items.map(item => ({
          id: `bri-${crypto.randomUUID()}`,
          baseRecipeId: id,
          ingredientId: item.ingredientId,
          quantity: parseFloat(item.quantity),
          ingredient: mockData.ingredients.find(i => i.id === item.ingredientId)
        }));
      }

      mockData.baseRecipes[recipeIndex] = updated;
      return res.status(200).json(updated);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (baseYield !== undefined) updateData.baseYield = parseFloat(baseYield);
    if (yieldUnit) updateData.yieldUnit = yieldUnit;

    const existingRecipe = await prisma.baseRecipe.findUnique({
      where: { id }
    });

    if (!existingRecipe || existingRecipe.userId !== req.user.id) {
      return res.status(404).json({ error: 'Receta base no encontrada o no tienes permiso para actualizarla' });
    }

    // Security: Verify ownership of ingredients before linking
    if (items && items.length > 0) {
      const ingredientIds = [...new Set(items.map(i => i.ingredientId))];
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

    const updatedBaseRecipe = await prisma.$transaction(async (tx) => {
      // Update basic details
      const br = await tx.baseRecipe.update({
        where: { id },
        data: updateData
      });

      // If items are provided, update the ingredients list
      if (items) {
        // Delete all existing base recipe ingredients
        await tx.baseRecipeIngredient.deleteMany({
          where: { baseRecipeId: id }
        });

        // Add new ones
        if (items.length > 0) {
          await tx.baseRecipeIngredient.createMany({
            data: items.map(item => ({
              baseRecipeId: id,
              ingredientId: item.ingredientId,
              quantity: parseFloat(item.quantity)
            }))
          });
        }
      }

      // Return the updated recipe with its ingredients
      return tx.baseRecipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    });

    res.status(200).json(updatedBaseRecipe);
  } catch (error) {
    console.error('Error updating base recipe:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Receta base no encontrada o no tienes permiso para actualizarla' });
    }
    res.status(500).json({ error: 'Error al actualizar la receta base' });
  }
};

export const deleteBaseRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (isTestMode()) {
      const usedInSuper = mockData.superRecipes.some(sr => sr.baseRecipes.some(br => br.baseRecipeId === id));

      if (usedInSuper) {
        return res.status(400).json({ error: 'No se puede eliminar la receta base porque está en uso en una Súper Receta.' });
      }

      mockData.baseRecipes = mockData.baseRecipes.filter(br => br.id !== id);
      return res.status(200).json({ message: 'Receta base eliminada exitosamente' });
    }

    const usedInSuper = await prisma.superRecipeBaseRecipe.findFirst({ where: { baseRecipeId: id } });

    if (usedInSuper) {
      return res.status(400).json({ error: 'No se puede eliminar la receta base porque está en uso en una Súper Receta.' });
    }

    await prisma.baseRecipe.delete({ 
      where: { 
        id,
        userId: req.user.id
      } 
    });

    res.status(200).json({ message: 'Receta base eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting base recipe:', error);
    res.status(500).json({ error: 'Error al eliminar la receta base' });
  }
};
