import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';

export const getIngredients = async (req, res) => {
  if (isTestMode()) {
    return res.status(200).json(mockData.ingredients.sort((a, b) => b.createdAt - a.createdAt));
  }
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
    const { name, globalCost, unitQuantity, measurementUnit, brand, userId } = req.body;

    const uid = userId || 'user-default-1';

    if (isTestMode()) {
      const newIngredient = {
        id: `ing-${Date.now()}`,
        name,
        globalCost: parseFloat(globalCost),
        unitQuantity: unitQuantity !== undefined ? parseFloat(unitQuantity) : 1,
        measurementUnit,
        brand: brand || null,
        userId: uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockData.ingredients.push(newIngredient);
      return res.status(201).json(newIngredient);
    }

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
        unitQuantity: unitQuantity !== undefined ? parseFloat(unitQuantity) : 1,
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
    const { name, globalCost, unitQuantity, measurementUnit, brand } = req.body;

    if (isTestMode()) {
      const ingredientIndex = mockData.ingredients.findIndex(i => i.id === id);
      if (ingredientIndex === -1) return res.status(404).json({ error: 'Ingrediente no encontrado' });

      const updated = {
        ...mockData.ingredients[ingredientIndex],
        ...(name && { name }),
        ...(globalCost !== undefined && { globalCost: parseFloat(globalCost) }),
        ...(unitQuantity !== undefined && { unitQuantity: parseFloat(unitQuantity) }),
        ...(measurementUnit && { measurementUnit }),
        ...(brand !== undefined && { brand })
      };
      mockData.ingredients[ingredientIndex] = updated;
      return res.status(200).json(updated);
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        ...(globalCost !== undefined && { globalCost: parseFloat(globalCost) }),
        ...(unitQuantity !== undefined && { unitQuantity: parseFloat(unitQuantity) }),
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

    if (isTestMode()) {
      const usedInBase = mockData.baseRecipes.some(br => br.ingredients.some(i => i.ingredientId === id));
      const usedInSuper = mockData.superRecipes.some(sr => sr.directIngredients.some(di => di.ingredientId === id));

      if (usedInBase || usedInSuper) {
        return res.status(400).json({ error: 'No se puede eliminar el ingrediente porque está en uso en una o más recetas.' });
      }

      mockData.ingredients = mockData.ingredients.filter(i => i.id !== id);
      return res.status(200).json({ message: 'Ingrediente eliminado exitosamente' });
    }

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
