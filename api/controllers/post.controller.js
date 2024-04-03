import { handleError } from "../utils/error.js"
import Post from '../models/post.model.js'

export const Create = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(handleError(403, 'You are not allowed to create a post'))
    }
    if (!req.body.title || !req.body.content) {
        return next(handleError(400, 'Please provide all required fields'))
    }
    const slug = req.body.title
        .split(' ')
        .join('-')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '')

    try {
        const newPost = await Post.create({
            ...req.body,
            slug,
            userId: req.user.id
        })
        res.status(201).json(newPost)
    } catch(error) {
        next(error)
    }
}


export const getPosts = async (req, res, next) => {
    try {
        // /api/post/get-posts?userId=${currentUser._id}&startIndex=${startIndex}
        //      the query it's from MongoDB and the startIndex is from query
        //      if we want to use params instand of query we just need to write the link like this:
        //      api/post/get-posts/${currentUser._id}/${startIndex}
        //      req.params.startIndex becausse in Route we write /get-posts/:currentUserId/:startIndex
        const startIndex = parseInt(req.query.startIndex) || 0
        const limit = parseInt(req.query.limit) || 9
        const sortDirection = req.query.order === 'asc' ? 1 : -1


        const posts = await Post.find({
            ...(req.query.userId && { userId: req.query.userId }),
            ...(req.query.category && { category: req.query.category }),
            ...(req.query.slug && { slug: req.query.slug }),
            ...(req.query.postId && { _id: req.query.postId }),
            ...(req.query.searchTerm && {
                $or: [
                    { title: { $regex: req.query.searchTerm, $options: 'i' } },
                    { content: { $regex: req.query.searchTerm, $options: 'i' } },
                ],
            })
        })
            .sort({ updatedAt: sortDirection })
            .skip(startIndex)
            .limit(limit)

        const totalPosts = await Post.countDocuments()

        const now = new Date()

        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        )

        const lastMonthPosts = await Post.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        })

        res.status(200).json({
            posts,
            totalPosts,
            lastMonthPosts,
        })
    } catch (error) {
        next(error)
    }
}


export const deletePost = async (req, res, next) => {
    if (!req.user.isAdmin || req.params.userId !== req.user.id) {
        return next(handleError(403, 'You are not allowed to delete this post'))
    }
    try {
        await Post.findByIdAndDelete(req.params.postId)
        res.status(200).json('The post has been deleted')
    } catch (error) {
        next(error)
    }

}


export const updatePost = async (req, res, next) => {
    if (!req.user.isAdmin || req.user.id !== req.params.userId) {
        return next(handleError(403, 'You are not allowed to update this post'))
    }
    const slug = req.body.title
        .split(' ')
        .join('-')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '')

    try {
        const newPost = await Post.findByIdAndUpdate(
            req.params.postId,
            {
                $set: {
                    ...req.body,
                    slug,
                }
            },
            { new : true }
        )
        res.status(200).json(newPost)

    } catch (error) {
        next(error)
    }
}