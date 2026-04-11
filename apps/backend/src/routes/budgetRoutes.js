import express from 'express';
import { createBudget, getBudgets, getBudgetById, updateBudget, deleteBudget } from '../controllers/budgetController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Proteger todas las rutas de Presupuestos
router.use(verifyToken);

router.post('/', createBudget);
router.get('/', getBudgets);

router.get('/:id', getBudgetById);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
