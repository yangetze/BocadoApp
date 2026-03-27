import prisma from '../prisma.js';

export const getIngredients = async (req, res) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Error al obtener los ingredientes' });
  }
};

export const createIngredient = async (req, res) => {
  try {
    const { name, globalCost, measurementUnit, brand, userId } = req.body;

    // Fallback to a default user if not provided, for MVP purposes
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

    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        globalCost: parseFloat(globalCost),
        measurementUnit,
        brand,
        userId: user.id
      }
    });

    res.status(201).json(newIngredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Error al crear el ingrediente' });
  }
};

export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, globalCost, measurementUnit, brand } = req.body;

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        ...(globalCost !== undefined && { globalCost: parseFloat(globalCost) }),
        measurementUnit,
        brand
      }
    });

    res.status(200).json(updatedIngredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Error al actualizar el ingrediente' });
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ingredient is used in any BaseRecipe or SuperRecipe
    const usedInBase = await prisma.baseRecipeIngredient.findFirst({ where: { ingredientId: id } });
    const usedInSuper = await prisma.superRecipeDirectIngredient.findFirst({ where: { ingredientId: id } });

    if (usedInBase || usedInSuper) {
      return res.status(400).json({ error: 'No se puede eliminar el ingrediente porque está en uso en una o más recetas.' });
    }

    await prisma.ingredient.delete({ where: { id } });

    res.status(200).json({ message: 'Ingrediente eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Error al eliminar el ingrediente' });
  }
};
