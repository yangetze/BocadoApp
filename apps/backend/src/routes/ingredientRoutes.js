import express from 'express';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../controllers/ingredientController.js';

const router = express.Router();

router.get('/', getIngredients);
router.post('/', createIngredient);
router.put('/:id', updateIngredient);
router.delete('/:id', deleteIngredient);

export default router;
