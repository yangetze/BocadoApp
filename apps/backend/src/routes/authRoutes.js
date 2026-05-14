import express from 'express';
import { login, register, getMe, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/login', loginLimiter, login);
router.post('/register', registerLimiter, register);
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, loginLimiter, changePassword);

export default router;
