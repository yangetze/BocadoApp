import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

// Add a dummy middleware to set req.user
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'user-1' };
  next();
};

import * as budgetController from '../src/controllers/budgetController.js';
import prisma from '../src/prisma.js';

describe('Budget Controller', () => {
  const app = express();
  app.use(express.json());
  app.use(mockAuthMiddleware);
  app.post('/api/budgets', budgetController.createBudget);
  app.get('/api/budgets', budgetController.getBudgets);
  app.get('/api/budgets/:id', budgetController.getBudgetById);
  app.put('/api/budgets/:id', budgetController.updateBudget);
  app.delete('/api/budgets/:id', budgetController.deleteBudget);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch budget by id successfully', async () => {
    const mockBudget = { id: 'budget-1', userId: 'user-1' };
    prisma.budget.findUnique.mockResolvedValue(mockBudget);

    const res = await request(app).get('/api/budgets/budget-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe('budget-1');
    expect(prisma.budget.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should return 404 if budget not found or not owned by user', async () => {
    prisma.budget.findUnique.mockResolvedValue({ id: 'budget-1', userId: 'other-user' });

    const res = await request(app).get('/api/budgets/budget-1');
    expect(res.statusCode).toBe(404);
  });

  it('should update budget successfully', async () => {
    const mockExistingBudget = { id: 'budget-1', userId: 'user-1' };
    const mockUpdatedBudget = { id: 'budget-1', userId: 'user-1', customerName: 'Updated Name' };
    prisma.budget.findUnique.mockResolvedValue(mockExistingBudget);
    prisma.$transaction.mockResolvedValue(mockUpdatedBudget);

    const payload = {
      customerName: 'Updated Name',
      profitMargin: 0.40,
      superRecipes: [
        { superRecipeId: 'sr-1', scaleQuantity: 3 }
      ]
    };

    const res = await request(app).put('/api/budgets/budget-1').send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body.customerName).toBe('Updated Name');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
  it('should delete budget successfully', async () => {
    const mockExistingBudget = { id: 'budget-1', userId: 'user-1' };
    prisma.budget.findUnique.mockResolvedValue(mockExistingBudget);
    prisma.budget.delete.mockResolvedValue(mockExistingBudget);

    const res = await request(app).delete('/api/budgets/budget-1');
    expect(res.statusCode).toBe(200);
    expect(prisma.budget.delete).toHaveBeenCalledTimes(1);
  });

  it('should create a budget successfully', async () => {
    const mockBudget = {
      id: 'budget-1',
      customerName: 'John Doe',
      profitMargin: 0.35,
      userId: 'user-1',
      superRecipes: [
        { superRecipeId: 'sr-1', scaleQuantity: 2 }
      ]
    };

    prisma.budget.create.mockResolvedValue(mockBudget);

    const payload = {
      customerName: 'John Doe',
      profitMargin: 0.35,
      userId: 'user-1',
      superRecipes: [
        { superRecipeId: 'sr-1', scaleQuantity: 2 }
      ]
    };

    const res = await request(app).post('/api/budgets').send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe('budget-1');
    expect(prisma.budget.create).toHaveBeenCalledTimes(1);
  });

  it('should fail to create a budget without superRecipes', async () => {
    const payload = {
      customerName: 'John Doe',
      profitMargin: 0.35,
      userId: 'user-1',
      // superRecipes is missing
    };

    const res = await request(app).post('/api/budgets').send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing required fields or invalid superRecipes array');
    expect(prisma.budget.create).not.toHaveBeenCalled();
  });

  it('should fetch budgets', async () => {
    const mockBudgets = [
      { id: 'b-1', customerName: 'A' },
      { id: 'b-2', customerName: 'B' }
    ];

    prisma.budget.findMany.mockResolvedValue(mockBudgets);

    const res = await request(app).get('/api/budgets');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(prisma.budget.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return 500 if budget creation fails', async () => {
    const payload = {
      customerName: 'John Doe',
      profitMargin: 0.35,
      superRecipes: [
        { superRecipeId: 'sr-1', scaleQuantity: 2 }
      ]
    };

    prisma.budget.create.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).post('/api/budgets').send(payload);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    expect(prisma.budget.create).toHaveBeenCalledTimes(1);
  });
});
