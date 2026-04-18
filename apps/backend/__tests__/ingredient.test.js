import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'user-default-1' };
    next();
  }
}));

const { default: ingredientRoutes } = await import('../src/routes/ingredientRoutes.js');
import prisma from '../src/prisma.js';

const app = express();
app.use(express.json());
app.use('/api/ingredients', ingredientRoutes);


describe('Ingredient Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ingredients', () => {
    it('should return a list of ingredients', async () => {
      const mockIngredients = [
        { id: '1', name: 'Flour', globalPrice: 1.5, measurementUnit: 'kg' },
        { id: '2', name: 'Sugar', globalPrice: 2.0, measurementUnit: 'kg' }
      ];
      prisma.ingredient.findMany.mockResolvedValue(mockIngredients);

      const res = await request(app).get('/api/ingredients');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockIngredients);
      expect(prisma.ingredient.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return a filtered list of ingredients when search query is provided', async () => {
      const mockIngredients = [
        { id: '1', name: 'Flour', globalPrice: 1.5, measurementUnit: 'kg' }
      ];
      prisma.ingredient.findMany.mockResolvedValue(mockIngredients);

      const res = await request(app).get('/api/ingredients?search=Flour');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockIngredients);
      expect(prisma.ingredient.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/ingredients', () => {
    it('should create a new ingredient', async () => {
      const newIngredient = { name: 'Eggs', globalPrice: 3.0, measurementUnit: 'u', brand: 'Farm', userId: 'user-default-1' };
      const createdIngredient = { id: '3', ...newIngredient };

      prisma.user.findUnique.mockResolvedValue({ id: 'user-default-1' });
      prisma.ingredient.create.mockResolvedValue(createdIngredient);

      const res = await request(app)
        .post('/api/ingredients')
        .send(newIngredient);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdIngredient);
      expect(prisma.ingredient.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/ingredients/:id', () => {
    it('should update an existing ingredient', async () => {
      const updatedData = { name: 'Brown Sugar', defaultCost: 2.5 };
      const expectedUpdatedIngredient = { id: '2', name: 'Brown Sugar', defaultCost: 2.5, measurementUnit: 'kg', userId: 'user-default-1' };

      // Mock ownership check
      prisma.ingredient.findUnique.mockResolvedValue(expectedUpdatedIngredient);

      // Mock transaction
      prisma.$transaction.mockResolvedValue(expectedUpdatedIngredient);

      const res = await request(app)
        .put('/api/ingredients/2')
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(expectedUpdatedIngredient);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/ingredients/:id', () => {
    it('should delete an ingredient if not used', async () => {
      prisma.baseRecipeIngredient.findFirst.mockResolvedValue(null);
      prisma.superRecipeDirectIngredient.findFirst.mockResolvedValue(null);
      prisma.ingredient.delete.mockResolvedValue({ id: '1' });

      const res = await request(app).delete('/api/ingredients/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Ingrediente eliminado exitosamente' });
      expect(prisma.ingredient.delete).toHaveBeenCalledTimes(1);
    });

    it('should not delete an ingredient if it is used', async () => {
      prisma.baseRecipeIngredient.findFirst.mockResolvedValue({ id: 'use1' });
      prisma.superRecipeDirectIngredient.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/ingredients/1');

      expect(res.statusCode).toBe(400);
      expect(prisma.ingredient.delete).not.toHaveBeenCalled();
    });

    it('should return 404 if the ingredient belongs to another user', async () => {
      const otherUserIngredient = { id: '1', name: 'Other Flour', userId: 'user-other' };
      prisma.ingredient.findUnique.mockResolvedValue(otherUserIngredient);

      const res = await request(app).delete('/api/ingredients/1');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Ingrediente no encontrado');
      expect(prisma.ingredient.delete).not.toHaveBeenCalled();
    });
  });
});
