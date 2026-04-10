import express from 'express'
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js'
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(verifyToken)
router.use(isAdmin)

router.get('/', getAllUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
