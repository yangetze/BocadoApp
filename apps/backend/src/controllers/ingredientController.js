import crypto from 'node:crypto';
import prisma from '../prisma.js';
import { isTestMode, mockData } from '../mockData.js';
import logger from '../utils/logger.js';

export const getIngredients = async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;
  
  if (isTestMode()) {
    let result = mockData.ingredients.filter(i => i.userId === userId);
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(lowerSearch) ||
        (i.presentations && i.presentations.some(p => p.brand && p.brand.toLowerCase().includes(lowerSearch)))
      );
    }
    return res.status(200).json(result.sort((a, b) => b.createdAt - a.createdAt));
  }
  try {
    const whereClause = { userId };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { presentations: { some: { brand: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const ingredients = await prisma.ingredient.findMany({
      where: whereClause,
      include: {
        presentations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(ingredients);
  } catch (error) {
    logger.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Error al obtener los ingredientes' });
  }
};

export const createIngredient = async (req, res) => {
  try {
    const { name, globalPrice, globalPriceQuantity = 1, measurementUnit, presentations } = req.body;
    const userId = req.user.id;

    // Security: Validate input length to prevent DoS via excessively large strings
    if (name && (typeof name !== 'string' || name.length > 255)) {
      return res.status(400).json({ error: 'El nombre es inválido o muy largo' });
    }
    if (measurementUnit && (typeof measurementUnit !== 'string' || measurementUnit.length > 50)) {
      return res.status(400).json({ error: 'La unidad de medida es inválida o muy larga' });
    }

    if (isTestMode()) {
      const newIngredient = {
        id: `ing-${crypto.randomUUID()}`,
        name,
        globalPrice: parseFloat(globalPrice),
        globalPriceQuantity: parseFloat(globalPriceQuantity),
        measurementUnit,
        presentations: presentations || [],
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
        globalPrice: parseFloat(globalPrice),
        globalPriceQuantity: parseFloat(globalPriceQuantity),
        measurementUnit,
        userId: userId,
        presentations: {
          create: presentations?.map(p => ({
            brand: p.brand,
            presentationName: p.presentationName,
            isFavorite: Boolean(p.isFavorite),
            cost: parseFloat(p.cost),
            unitQuantity: parseFloat(p.unitQuantity),
            measurementUnit: p.measurementUnit
          })) || []
        }
      },
      include: {
        presentations: true
      }
    });

    res.status(201).json(newIngredient);
  } catch (error) {
    logger.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Error al crear el ingrediente' });
  }
};

export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, globalPrice, globalPriceQuantity = 1, measurementUnit, presentations } = req.body;

    // Security: Validate input length to prevent DoS via excessively large strings
    if (name !== undefined && (typeof name !== 'string' || name.length > 255)) {
      return res.status(400).json({ error: 'El nombre es inválido o muy largo' });
    }
    if (measurementUnit !== undefined && (typeof measurementUnit !== 'string' || measurementUnit.length > 50)) {
      return res.status(400).json({ error: 'La unidad de medida es inválida o muy larga' });
    }

    if (isTestMode()) {
      const ingredientIndex = mockData.ingredients.findIndex(i => i.id === id);
      if (ingredientIndex === -1) return res.status(404).json({ error: 'Ingrediente no encontrado' });

      const updated = {
        ...mockData.ingredients[ingredientIndex],
        ...(name && { name }),
        ...(globalPrice !== undefined && { globalPrice: parseFloat(globalPrice) }),
           ...(globalPriceQuantity !== undefined && { globalPriceQuantity: parseFloat(globalPriceQuantity) }),
        ...(measurementUnit && { measurementUnit }),
        ...(presentations && { presentations })
      };
      mockData.ingredients[ingredientIndex] = updated;
      return res.status(200).json(updated);
    }

    // Validate ownership
    const existingIngredient = await prisma.ingredient.findUnique({ where: { id } });
    if (!existingIngredient || existingIngredient.userId !== req.user.id) {
       return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    const updatedIngredient = await prisma.$transaction(async (tx) => {
       await tx.ingredient.update({
         where: { id },
         data: {
           name,
           ...(globalPrice !== undefined && { globalPrice: parseFloat(globalPrice) }),
           ...(globalPriceQuantity !== undefined && { globalPriceQuantity: parseFloat(globalPriceQuantity) }),
           measurementUnit
         }
       });

       if (presentations) {
          await tx.brandPresentation.deleteMany({ where: { ingredientId: id } });
          if (presentations.length > 0) {
              await tx.brandPresentation.createMany({
                 data: presentations.map(p => ({
                    ingredientId: id,
                    brand: p.brand,
                    presentationName: p.presentationName,
                    isFavorite: Boolean(p.isFavorite),
                    cost: parseFloat(p.cost),
                    unitQuantity: parseFloat(p.unitQuantity),
                    measurementUnit: p.measurementUnit
                 }))
              });
          }
       }

       return tx.ingredient.findUnique({
          where: { id },
          include: { presentations: true }
       });
    });

    res.status(200).json(updatedIngredient);
  } catch (error) {
    logger.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Error al actualizar el ingrediente' });
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    if (isTestMode()) {
      const ingredient = mockData.ingredients.find(i => i.id === id);
      if (!ingredient || ingredient.userId !== req.user.id) {
        return res.status(404).json({ error: 'Ingrediente no encontrado' });
      }

      const usedInBase = mockData.baseRecipes.some(br => br.ingredients.some(i => i.ingredientId === id));
      const usedInSuper = mockData.superRecipes.some(sr => sr.directIngredients.some(di => di.ingredientId === id));

      if (usedInBase || usedInSuper) {
        return res.status(400).json({ error: 'No se puede eliminar el ingrediente porque está en uso en una o más recetas.' });
      }

      mockData.ingredients = mockData.ingredients.filter(i => i.id !== id);
      return res.status(200).json({ message: 'Ingrediente eliminado exitosamente' });
    }

    // Validate ownership
    const existingIngredient = await prisma.ingredient.findUnique({ where: { id } });
    if (!existingIngredient || existingIngredient.userId !== req.user.id) {
       return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    const usedInBase = await prisma.baseRecipeIngredient.findFirst({ where: { ingredientId: id } });
    const usedInSuper = await prisma.superRecipeDirectIngredient.findFirst({ where: { ingredientId: id } });

    if (usedInBase || usedInSuper) {
      return res.status(400).json({ error: 'No se puede eliminar el ingrediente porque está en uso en una o más recetas.' });
    }

    await prisma.ingredient.delete({ 
      where: { id }
    });

    res.status(200).json({ message: 'Ingrediente eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Error al eliminar el ingrediente' });
  }
};
