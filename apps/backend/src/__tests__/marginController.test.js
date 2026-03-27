import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';
import * as marginController from '../controllers/marginController.js';
import prisma from '../prisma.js';

describe('Margin Controller', () => {
  let app;
  let originalFindUnique;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.get('/api/margins/recommend/:superRecipeId', marginController.recommendMargin);

    originalFindUnique = prisma.superRecipe.findUnique;
  });

  afterAll(() => {
    prisma.superRecipe.findUnique = originalFindUnique;
  });

  beforeEach(() => {
    prisma.superRecipe.findUnique = jest.fn();
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
