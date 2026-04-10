import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'test-user-id', username: 'testuser' };
    next();
  },
  requireAdmin: (req, res, next) => next(),
  isAdmin: (req, res, next) => next()
}));

const express = (await import('express')).default;
const request = (await import('supertest')).default;
const marginRoutes = (await import('../src/routes/marginRoutes.js')).default;
const marginController = await import('../src/controllers/marginController.js');
const prisma = (await import('../src/prisma.js')).default;

describe('Margin Controller', () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { id: 'user1', role: 'USER' };
    next();
  });
  app.get('/api/margins/recommend/:superRecipeId', marginController.recommendMargin);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if SuperRecipe is not found', async () => {
    prisma.superRecipe.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/margins/recommend/non-existent-id');
    expect(res.statusCode).toBe(404);
  });

  it('should calculate low complexity correctly (margin 30%)', async () => {
    prisma.superRecipe.findUnique.mockResolvedValue({
      id: 'simple-recipe',
      name: 'Simple Cake',
      userId: 'user1',
      directIngredients: [ { id: 'box' } ],
      baseRecipes: [
        {
          baseRecipe: { ingredients: [ { id: 'flour' } ] }
        }
      ]
    });
    const res = await request(app).get('/api/margins/recommend/simple-recipe');
    expect(res.statusCode).toBe(200);
    expect(res.body.suggestedMargin).toBe(0.30);
  });

  it('should calculate medium complexity correctly (margin 40%)', async () => {
    prisma.superRecipe.findUnique.mockResolvedValue({
      id: 'medium-recipe',
      name: 'Medium Cake',
      userId: 'user1',
      directIngredients: [ { id: 'box' }, { id: 'board' }, { id: 'ribbon' } ],
      baseRecipes: [
        { baseRecipe: { ingredients: [ { id: 'i1' }, { id: 'i2' }, { id: 'i3' } ] } },
        { baseRecipe: { ingredients: [ { id: 'i4' }, { id: 'i5' }, { id: 'i6' } ] } }
      ]
    });
    const res = await request(app).get('/api/margins/recommend/medium-recipe');
    expect(res.statusCode).toBe(200);
    expect(res.body.suggestedMargin).toBe(0.40);
  });

  it('should calculate high complexity correctly (margin 50%)', async () => {
    prisma.superRecipe.findUnique.mockResolvedValue({
      id: 'complex-recipe',
      name: 'Complex Wedding Cake',
      userId: 'user1',
      directIngredients: [ { id: 'd1' }, { id: 'd2' }, { id: 'd3' }, { id: 'd4' }, { id: 'd5' } ],
      baseRecipes: [
        { baseRecipe: { ingredients: [ { id: 'i1' }, { id: 'i2' }, { id: 'i3' } ] } },
        { baseRecipe: { ingredients: [ { id: 'i1' }, { id: 'i2' }, { id: 'i3' } ] } },
        { baseRecipe: { ingredients: [ { id: 'i1' }, { id: 'i2' }, { id: 'i3' } ] } },
        { baseRecipe: { ingredients: [ { id: 'i1' }, { id: 'i2' }, { id: 'i3' } ] } }
      ]
    });
    const res = await request(app).get('/api/margins/recommend/complex-recipe');
    expect(res.statusCode).toBe(200);
    expect(res.body.suggestedMargin).toBe(0.50);
  });
});
