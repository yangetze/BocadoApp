import express from 'express'
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../controllers/ingredientController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Todas las rutas de ingredientes requieren autenticación
router.use(verifyToken)

router.get('/', getIngredients)
router.post('/', createIngredient)
router.put('/:id', updateIngredient)
router.delete('/:id', deleteIngredient)

export default router
