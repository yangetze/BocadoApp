import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser, updateProfile } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// User Profile Route (No Admin required)
router.put('/profile', updateProfile);

router.use(isAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
