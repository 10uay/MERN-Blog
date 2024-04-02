import express from 'express';
import { verifyToken } from '../utils/verifyToken.js'
import { updateUser, deleteUser, getUsers, getUser } from '../controllers/user.controller.js'

const router = express.Router()

router.put('/update/:userId', verifyToken, updateUser)
router.delete('/delete/:userId', verifyToken, deleteUser)
router.get('/get-users', verifyToken, getUsers)
router.get('/:userId', getUser)


export default router