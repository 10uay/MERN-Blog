import { handleError } from '../utils/error.js'
import bcryptjs from 'bcryptjs'
import User from '../models/user.model.js'


export const updateUser = async (req, res, next) => {
    // 1- req.user.id this is from verify function from token
    // 2- req.params.userId this is from id of the current user that signIn right now and we 
    //    get it from path: update/:userId , so if we change userId name it will change from params
    if (req.user.id !== req.params.userId) {return next(handleError(401, "you should logIn again!!!"))}

    try {
        if (req.body.password) req.body.password = bcryptjs.hashSync(req.body.password, 10)
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    photoProfile: req.body.photoProfile,
                }
            },
            { new : true }
        )
        const { password, ...rest } = updatedUser._doc
        res.status(200).json(rest)
    }
    catch (error) {
        next(error)
    }
}

export const deleteUser = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
        return next(handleError(401, 'You can delete only your account!'))
    }
    try {
        await User.findByIdAndDelete(req.params.userId)
        res.status(200).json('User has been deleted...')
    } catch (error) {
        next(error)
    }

}

export const getUsers = async (req, res, next) => {
    if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'))
    }

    try {
        const startIndex = parseInt(req.query.startIndex) || 0
        const limit = parseInt(req.query.limit) || 9
        const sortDirection = req.query.order === 'asc' ? 1 : -1

        
        const users = await User.find()
            .sort({ updatedAt: sortDirection })
            .skip(startIndex)
            .limit(limit)
        
        const userWithoutPassword = users.map(user => {
            const { password, ...rest } = user._doc
            return rest
        })

        const totalUsers = await User.countDocuments()

        const now = new Date()

        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        )

        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        })

        res.status(200).json({
            users: userWithoutPassword,
            totalUsers,
            lastMonthUsers
        })
    } catch (error) {
        console.log('llllllllll');
        next(error)
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)
        if (!user) {
        return next(errorHandler(404, 'User not found'))
        }
        const { password, ...rest } = user._doc
        res.status(200).json(rest)
    } catch (error) {
        next(error)
    }
}