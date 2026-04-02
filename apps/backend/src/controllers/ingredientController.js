import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';

export const getIngredients = async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;
  
  if (isTestMode()) {
    let result = mockData.ingredients.filter(i => i.userId === userId);
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(lowerSearch) ||
        (i.brand && i.brand.toLowerCase().includes(lowerSearch))
      );
    }
    return res.status(200).json(result.sort((a, b) => b.createdAt - a.createdAt));
  }
  try {
    const whereClause = { userId };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    const ingredients = await prisma.ingredient.findMany({
      where: whereClause,
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
    const { name, globalCost, unitQuantity, measurementUnit, brand } = req.body;
    const userId = req.user.id; // Obtenido del token decodificado

    if (isTestMode()) {
      const newIngredient = {
        id: `ing-${Date.now()}`,
        name,
        globalCost: parseFloat(globalCost),
        unitQuantity: unitQuantity !== undefined ? parseFloat(unitQuantity) : 1,
        measurementUnit,
        brand: brand || null,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockData.ingredients.push(newIngredient);
      return res.status(201).json(newIngredient);
    }

    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        globalCost: parseFloat(globalCost),
        unitQuantity: unitQuantity !== undefined ? parseFloat(unitQuantity) : 1,
        measurementUnit,
        brand,
        userId: userId // Vinculamos al usuario real de Supabase
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
      where: { 
        id,
        userId: req.user.id // Verificamos propiedad
      },
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

    await prisma.ingredient.delete({ 
      where: { 
        id,
        userId: req.user.id // Verificamos propiedad 
      } 
    });

    res.status(200).json({ message: 'Ingrediente eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Error al eliminar el ingrediente' });
  }
};
