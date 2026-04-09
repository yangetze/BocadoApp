import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'user-default-1' };
    next();
  }
}));

const { default: superRecipeRoutes } = await import('../src/routes/superRecipeRoutes.js');
import prisma from '../src/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/super-recipes', superRecipeRoutes);


describe('Super Recipe Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/super-recipes', () => {
    it('should return a list of super recipes', async () => {
      const mockSuperRecipes = [
        { id: 'sr-1', name: 'Chocolate Cake', description: 'Yummy' }
      ];
      prisma.superRecipe.findMany.mockResolvedValue(mockSuperRecipes);

      const res = await request(app).get('/api/super-recipes');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockSuperRecipes);
    });
  });

  describe('POST /api/super-recipes', () => {
    it('should create a new super recipe', async () => {
      const payload = {
        name: 'Wedding Cake',
        baseRecipes: [{ baseRecipeId: 'br-1', quantityNeeded: 1000 }],
        directIngredients: [{ ingredientId: 'i-1', quantityNeeded: 1 }]
      };

      const created = { id: 'sr-2', name: 'Wedding Cake', baseRecipes: [], directIngredients: [] };
      
      prisma.user.findUnique.mockResolvedValue({ id: 'user-default-1' });
      prisma.superRecipe.create.mockResolvedValue(created);

      const res = await request(app).post('/api/super-recipes').send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(created);
      expect(prisma.superRecipe.create).toHaveBeenCalled();
    });
  });


  describe('PUT /api/super-recipes/:id', () => {
    it('should error if linking unauthorized base recipe (IDOR)', async () => {
      prisma.superRecipe.findUnique.mockResolvedValue({ id: 'sr-1', userId: 'user-default-1' });
      // Mocking that the base recipe doesn't belong to the user
      prisma.baseRecipe = { ...prisma.baseRecipe, count: jest.fn().mockResolvedValue(0) };

      const payload = {
        name: 'Updated Cake',
        baseRecipes: [{ baseRecipeId: 'br-unauthorized', quantityNeeded: 10 }]
      };

      const res = await request(app).put('/api/super-recipes/sr-1').send(payload);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('recetas base no fueron encontradas');
    });

    it('should error if linking unauthorized direct ingredient (IDOR)', async () => {
      prisma.superRecipe.findUnique.mockResolvedValue({ id: 'sr-1', userId: 'user-default-1' });
      prisma.baseRecipe = { ...prisma.baseRecipe, count: jest.fn().mockResolvedValue(0) };
      // Mocking that the ingredient doesn't belong to the user
      prisma.ingredient = { ...prisma.ingredient, count: jest.fn().mockResolvedValue(0) };

      const payload = {
        name: 'Updated Cake',
        directIngredients: [{ ingredientId: 'i-unauthorized', quantityNeeded: 1 }]
      };

      const res = await request(app).put('/api/super-recipes/sr-1').send(payload);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('ingredientes no fueron encontrados');
    });
  });

  describe('DELETE /api/super-recipes/:id', () => {
    it('should delete if not used in budget', async () => {
      prisma.superRecipe.findUnique.mockResolvedValue({ id: 'sr-1', userId: 'user-default-1' });
      prisma.budgetSuperRecipe.findFirst.mockResolvedValue(null);
      prisma.superRecipe.delete.mockResolvedValue({ id: 'sr-1' });

      const res = await request(app).delete('/api/super-recipes/sr-1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Súper receta eliminada exitosamente');
    });

    it('should error if used in budget', async () => {
      prisma.superRecipe.findUnique.mockResolvedValue({ id: 'sr-1', userId: 'user-default-1' });
      prisma.budgetSuperRecipe.findFirst.mockResolvedValue({ id: 'b-sr-1' });

      const res = await request(app).delete('/api/super-recipes/sr-1');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('en uso');
    });
  });
});
