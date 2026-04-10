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

  describe('DELETE /api/super-recipes/:id', () => {
    it('should delete if not used in budget', async () => {
      prisma.budgetSuperRecipe.findFirst.mockResolvedValue(null);
      prisma.superRecipe.delete.mockResolvedValue({ id: 'sr-1' });

      const res = await request(app).delete('/api/super-recipes/sr-1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Súper receta eliminada exitosamente');
    });

    it('should error if used in budget', async () => {
      prisma.budgetSuperRecipe.findFirst.mockResolvedValue({ id: 'b-sr-1' });

      const res = await request(app).delete('/api/super-recipes/sr-1');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('en uso');
    });
  });
});
