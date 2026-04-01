import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
