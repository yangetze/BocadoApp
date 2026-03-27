import express from 'express';
import { createBudget, getBudgets } from '../controllers/budgetController.js';

const router = express.Router();

router.post('/', createBudget);
router.get('/', getBudgets);

export default router;
