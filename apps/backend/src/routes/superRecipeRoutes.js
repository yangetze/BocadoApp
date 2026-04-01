import express from 'express';
import { getSuperRecipes, createSuperRecipe, updateSuperRecipe, deleteSuperRecipe } from '../controllers/superRecipeController.js';

const router = express.Router();

router.get('/', getSuperRecipes);
router.post('/', createSuperRecipe);
router.put('/:id', updateSuperRecipe);
router.delete('/:id', deleteSuperRecipe);

export default router;
