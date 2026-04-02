import express from 'express';
import { getSuperRecipes, createSuperRecipe, updateSuperRecipe, deleteSuperRecipe } from '../controllers/superRecipeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Proteger todas las rutas de Súper Recetas
router.use(verifyToken);

router.get('/', getSuperRecipes);
router.post('/', createSuperRecipe);
router.put('/:id', updateSuperRecipe);
router.delete('/:id', deleteSuperRecipe);

export default router;
