import request from 'supertest'
import express from 'express'
import { jest } from '@jest/globals'
import prisma from '../src/prisma.js'

jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'user-default-1' }
    next()
  }
}))

const { default: baseRecipeRoutes } = await import('../src/routes/baseRecipeRoutes.js')

const app = express()
app.use(express.json())
app.use('/api/base-recipes', baseRecipeRoutes)

describe('Base Recipe Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/base-recipes', () => {
    it('should return a list of base recipes', async () => {
      const mockBaseRecipes = [
        { id: '1', name: 'Dough', baseYield: 1000, yieldUnit: 'gr' },
        { id: '2', name: 'Sauce', baseYield: 500, yieldUnit: 'ml' }
      ]
      prisma.baseRecipe.findMany.mockResolvedValue(mockBaseRecipes)

      const res = await request(app).get('/api/base-recipes')

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(mockBaseRecipes)
      expect(prisma.baseRecipe.findMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST /api/base-recipes', () => {
    it('should create a new base recipe', async () => {
      const newBaseRecipe = {
        name: 'Ganache',
        baseYield: 500,
        yieldUnit: 'gr',
        ingredients: [{ ingredientId: 'ing1', quantity: 250 }, { ingredientId: 'ing2', quantity: 250 }]
      }

      const createdBaseRecipe = {
        id: '1',
        name: 'Ganache',
        baseYield: 500,
        yieldUnit: 'gr',
        ingredients: [{ id: 'link1' }, { id: 'link2' }]
      }

      prisma.user.findUnique.mockResolvedValue({ id: 'user-default-1' })
      prisma.ingredient = { ...prisma.ingredient, count: jest.fn().mockResolvedValue(2) }
      prisma.baseRecipe.create.mockResolvedValue(createdBaseRecipe)

      const res = await request(app)
        .post('/api/base-recipes')
        .send(newBaseRecipe)

      expect(res.statusCode).toBe(201)
      expect(res.body).toEqual(createdBaseRecipe)
      expect(prisma.baseRecipe.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('PUT /api/base-recipes/:id', () => {
    it('should update a base recipe and its ingredients if valid', async () => {
      const existingRecipe = { id: '1', userId: 'user-default-1' }
      const updatedRecipe = {
        id: '1',
        name: 'Ganache Updated',
        baseYield: 600,
        yieldUnit: 'gr',
        ingredients: [{ id: 'link1', ingredientId: 'ing1', quantity: 300 }]
      }

      prisma.baseRecipe.findUnique.mockResolvedValueOnce(existingRecipe) // For authorization check
      prisma.ingredient = { ...prisma.ingredient, count: jest.fn().mockResolvedValue(1) } // Verify ingredient ownership
      prisma.$transaction.mockResolvedValueOnce(updatedRecipe)

      const res = await request(app)
        .put('/api/base-recipes/1')
        .send({
          name: 'Ganache Updated',
          baseYield: 600,
          yieldUnit: 'gr',
          items: [{ ingredientId: 'ing1', quantity: 300 }]
        })

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(updatedRecipe)
      expect(prisma.ingredient.count).toHaveBeenCalledWith({
        where: { id: { in: ['ing1'] }, userId: 'user-default-1' }
      })
      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    })

    it('should return 404 if ingredient ownership check fails during update', async () => {
      const existingRecipe = { id: '1', userId: 'user-default-1' }

      prisma.baseRecipe.findUnique.mockResolvedValueOnce(existingRecipe) // For authorization check
      prisma.ingredient = { ...prisma.ingredient, count: jest.fn().mockResolvedValue(0) } // Simulate missing/unowned ingredient

      const res = await request(app)
        .put('/api/base-recipes/1')
        .send({
          items: [{ ingredientId: 'unowned-ing', quantity: 100 }]
        })

      expect(res.statusCode).toBe(404)
      expect(res.body).toEqual({ error: 'Uno o más ingredientes no fueron encontrados o no tienes permiso' })
      expect(prisma.ingredient.count).toHaveBeenCalledWith({
        where: { id: { in: ['unowned-ing'] }, userId: 'user-default-1' }
      })
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/base-recipes/:id', () => {
    it('should delete a base recipe if not used', async () => {
      prisma.superRecipeBaseRecipe.findFirst.mockResolvedValue(null)
      prisma.baseRecipe.delete.mockResolvedValue({ id: '1' })

      const res = await request(app).delete('/api/base-recipes/1')

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual({ message: 'Receta base eliminada exitosamente' })
      expect(prisma.baseRecipe.delete).toHaveBeenCalledTimes(1)
    })

    it('should not delete a base recipe if it is used', async () => {
      prisma.superRecipeBaseRecipe.findFirst.mockResolvedValue({ id: 'use1' })

      const res = await request(app).delete('/api/base-recipes/1')

      expect(res.statusCode).toBe(400)
      expect(prisma.baseRecipe.delete).not.toHaveBeenCalled()
    })
  })
})
