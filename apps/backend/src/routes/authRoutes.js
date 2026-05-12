import express from 'express';
import { login, register, getMe, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, authLimiter, changePassword);

export default router;
