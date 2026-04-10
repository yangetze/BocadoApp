import express from 'express'
import { getBaseRecipes, createBaseRecipe, updateBaseRecipe, deleteBaseRecipe } from '../controllers/baseRecipeController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Todas las rutas de recetas base requieren autenticación
router.use(verifyToken)

router.get('/', getBaseRecipes)
router.post('/', createBaseRecipe)
router.put('/:id', updateBaseRecipe)
router.delete('/:id', deleteBaseRecipe)

export default router
