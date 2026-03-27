import prisma from '../prisma.js';

export const getBaseRecipes = async (req, res) => {
  try {
    const baseRecipes = await prisma.baseRecipe.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
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
    const { name, baseYield, yieldUnit, userId, items } = req.body;

    // Fallback to a default user if not provided
    const uid = userId || 'user-default-1';

    // Verify user exists or create default
    let user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uid,
          email: `default-${Date.now()}@bocadoapp.com`,
          name: 'Default User'
        }
      });
    }

    const newBaseRecipe = await prisma.baseRecipe.create({
      data: {
        name,
        baseYield: parseFloat(baseYield),
        yieldUnit,
        userId: user.id,
        ingredients: {
          create: items.map(item => ({
            quantity: parseFloat(item.quantity),
            ingredient: { connect: { id: item.ingredientId } }
          }))
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    res.status(201).json(newBaseRecipe);
  } catch (error) {
    console.error('Error creating base recipe:', error);
    res.status(500).json({ error: 'Error al crear la receta base' });
  }
};

export const updateBaseRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, baseYield, yieldUnit, items } = req.body;

    // We can update the simple fields, but for ingredients it's easier to delete and recreate the links
    const updateData = {};
    if (name) updateData.name = name;
    if (baseYield !== undefined) updateData.baseYield = parseFloat(baseYield);
    if (yieldUnit) updateData.yieldUnit = yieldUnit;

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
    res.status(500).json({ error: 'Error al actualizar la receta base' });
  }
};

export const deleteBaseRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if base recipe is used in any SuperRecipe
    const usedInSuper = await prisma.superRecipeBaseRecipe.findFirst({ where: { baseRecipeId: id } });

    if (usedInSuper) {
      return res.status(400).json({ error: 'No se puede eliminar la receta base porque está en uso en una Súper Receta.' });
    }

    await prisma.baseRecipe.delete({ where: { id } });

    res.status(200).json({ message: 'Receta base eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting base recipe:', error);
    res.status(500).json({ error: 'Error al eliminar la receta base' });
  }
};
