import express from 'express'
import { login, register, getMe } from '../controllers/authController.js'
import { verifyToken } from '../middleware/authMiddleware.js'
import { authLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

router.post('/login', authLimiter, login)
router.post('/register', authLimiter, register)
router.get('/me', verifyToken, getMe)

export default router
