import express from 'express';
import { getBaseRecipes, createBaseRecipe, updateBaseRecipe, deleteBaseRecipe } from '../controllers/baseRecipeController.js';

const router = express.Router();

router.get('/', getBaseRecipes);
router.post('/', createBaseRecipe);
router.put('/:id', updateBaseRecipe);
router.delete('/:id', deleteBaseRecipe);

export default router;
