import express from 'express'
import { Create, getPosts, deletePost, updatePost } from '../controllers/post.controller.js'
import { verifyToken } from '../utils/verifyToken.js'

const router = express.Router()

router.post('/create', verifyToken, Create)
router.get('/get-posts', verifyToken, getPosts)
router.delete('/delete-post/:postId/:userId', verifyToken, deletePost)
router.put('/update-post/:postId/:userId', verifyToken, updatePost)





export default router