import express from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'

import * as budgetController from '../src/controllers/budgetController.js'
import prisma from '../src/prisma.js'

// Add a dummy middleware to set req.user
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'user-1' }
  next()
}

describe('Budget Controller', () => {
  const app = express()
  app.use(express.json())
  app.use(mockAuthMiddleware)
  app.post('/api/budgets', budgetController.createBudget)
  app.get('/api/budgets', budgetController.getBudgets)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a budget successfully', async () => {
    const mockBudget = {
      id: 'budget-1',
      customerName: 'John Doe',
      profitMargin: 0.35,
      userId: 'user-1',
      superRecipes: [
        { superRecipeId: 'sr-1', scaleQuantity: 2 }
      ]
    }

    prisma.budget.create.mockResolvedValue(mockBudget)

    const payload = {
      customerName: 'John Doe',
      profitMargin: 0.35,
      userId: 'user-1',
      superRecipes: [
        { superRecipeId: 'sr-1', scaleQuantity: 2 }
      ]
    }

    const res = await request(app).post('/api/budgets').send(payload)

    expect(res.statusCode).toBe(201)
    expect(res.body.id).toBe('budget-1')
    expect(prisma.budget.create).toHaveBeenCalledTimes(1)
  })

  it('should fail to create a budget without superRecipes', async () => {
    const payload = {
      customerName: 'John Doe',
      profitMargin: 0.35,
      userId: 'user-1'
      // superRecipes is missing
    }

    const res = await request(app).post('/api/budgets').send(payload)

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBe('Missing required fields or invalid superRecipes array')
    expect(prisma.budget.create).not.toHaveBeenCalled()
  })

  it('should fetch budgets', async () => {
    const mockBudgets = [
      { id: 'b-1', customerName: 'A' },
      { id: 'b-2', customerName: 'B' }
    ]

    prisma.budget.findMany.mockResolvedValue(mockBudgets)

    const res = await request(app).get('/api/budgets')

    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(2)
    expect(prisma.budget.findMany).toHaveBeenCalledTimes(1)
  })

  it('should return 500 if budget creation fails', async () => {
    const payload = {
      customerName: 'John Doe',
      profitMargin: 0.35,
      superRecipes: [
        { superRecipeId: 'sr-1', scaleQuantity: 2 }
      ]
    }

    prisma.budget.create.mockRejectedValue(new Error('DB Error'))

    const res = await request(app).post('/api/budgets').send(payload)

    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('Internal server error')
    expect(prisma.budget.create).toHaveBeenCalledTimes(1)
  })
})
