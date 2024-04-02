import express from 'express'
import { createComment, getPostsComments, likeComment, editComment, deleteComment, getcomments } from '../controllers/comment.controller.js'
import { verifyToken } from '../utils/verifyToken.js'

const router = express.Router()

router.post('/create', verifyToken, createComment)
router.get('/get-posts-comment/:postId', getPostsComments)
router.put('/like-comment/:commentId', verifyToken, likeComment)
router.put('/edit-comment/:commentId', verifyToken, editComment)
router.delete('/delete-comment/:commentId', verifyToken, deleteComment)
router.get('/get-comments',verifyToken , getcomments)




export default router