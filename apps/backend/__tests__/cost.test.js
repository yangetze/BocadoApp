import request from 'supertest';
import express from 'express';
import costRoutes from '../src/routes/costRoutes.js';
import prisma from '../src/prisma.js';
import { jest } from '@jest/globals';

const app = express();
app.use(express.json());
app.use('/api', costRoutes);

describe('Cost API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/calculate-cost/:superRecipeId', () => {
    it('should return 400 for invalid yield parameter', async () => {
      const response = await request(app).get('/api/calculate-cost/1?yield=-5');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid yield parameter' });
    });

    it('should return 404 if SuperRecipe is not found', async () => {
      prisma.superRecipe.findUnique.mockResolvedValue(null);
      const response = await request(app).get('/api/calculate-cost/999');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'SuperRecipe not found' });
    });

    it('should calculate cost correctly', async () => {
      // Mock exchange rate finding logic since it is used in calculation
      prisma.exchangeRate.findMany.mockResolvedValue([
        { targetCurrency: { code: 'VES', symbol: 'Bs' }, rate: 40 }
      ]);

      const mockSuperRecipe = {
        id: '1',
        name: 'Wedding Cake',
        baseRecipes: [
          {
            quantityNeeded: 2000,
            baseRecipe: {
              name: 'Sponge Cake',
              baseYield: 1000,
              ingredients: [
                { quantity: 500, ingredient: { name: 'Flour', globalCost: 0.002 } },
                { quantity: 500, ingredient: { name: 'Sugar', globalCost: 0.001 } }
              ]
            }
          }
        ],
        directIngredients: [
          { quantityNeeded: 1, ingredient: { name: 'Cake Box', globalCost: 2.5 } }
        ]
      };

      prisma.superRecipe.findUnique.mockResolvedValue(mockSuperRecipe);

      const response = await request(app).get('/api/calculate-cost/1?yield=2');
      expect(response.status).toBe(200);

      // Base Recipe cost (for 1000 yield):
      // Flour = 500 * 0.002 = 1.0
      // Sugar = 500 * 0.001 = 0.5
      // Total Base = 1.5 per 1000.
      // Super recipe needs 2000 => (2000/1000) * 1.5 = 3.0
      // Scale multiplier = 2 => 3.0 * 2 = 6.0

      // Direct Ingredient cost:
      // Box = 1 * 2.5 = 2.5
      // Scale multiplier = 2 => 2.5 * 2 = 5.0

      // Total Cost = 6.0 + 5.0 = 11.0 USD

      expect(response.body.costs.baseCost).toBe(11.0);
      expect(response.body.scaleMultiplier).toBe(2);
      expect(response.body.costs.convertedCosts[0].cost).toBe(440); // 11.0 * 40
    });
  });
});
