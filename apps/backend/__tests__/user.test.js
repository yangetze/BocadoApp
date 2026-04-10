import request from 'supertest'
import express from 'express'
import { jest } from '@jest/globals'
import prisma from '../src/prisma.js'

jest.unstable_mockModule('../src/middleware/authMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'user-default-1', role: 'ADMIN' }
    next()
  },
  isAdmin: (req, res, next) => {
    next()
  }
}))

const { default: userRoutes } = await import('../src/routes/userRoutes.js')

const app = express()
app.use(express.json())
app.use('/api/users', userRoutes)

describe('User Routes - getAllUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('should return a list of users successfully', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'johndoe',
          email: 'john@example.com',
          name: 'John Doe',
          identificationNumber: '123456789',
          active: true,
          role: 'ADMIN',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-2',
          username: 'janedoe',
          email: 'jane@example.com',
          name: 'Jane Doe',
          identificationNumber: '987654321',
          active: true,
          role: 'USER',
          createdAt: new Date().toISOString()
        }
      ]

      prisma.user.findMany.mockResolvedValue(mockUsers)

      const res = await request(app).get('/api/users')

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(mockUsers)
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1)
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          identificationNumber: true,
          active: true,
          role: true,
          createdAt: true
        }
      })
    })

    it('should return a 500 status when a database error occurs', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database error'))

      // Suppress console.error for the expected error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const res = await request(app).get('/api/users')

      expect(res.statusCode).toBe(500)
      expect(res.body).toEqual({ error: 'Error interno del servidor' })
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1)

      consoleErrorSpy.mockRestore()
    })
  })
})
