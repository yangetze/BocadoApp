import express from 'express'
import { createBudget, getBudgets } from '../controllers/budgetController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Proteger todas las rutas de Presupuestos
router.use(verifyToken)

router.post('/', createBudget)
router.get('/', getBudgets)

export default router
