import jwt from "jsonwebtoken"
import { handleError } from './error.js'

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token
    
    if (!token) return next(handleError(401, "Unauthorized"))

    // get user from token and store it in req.user that will
    //      send to the next function (updateUser)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(handleError(403, 'Unauthorized'))

        // in user there is the id and iat from the token
        req.user = user
        // this next() to move to the following function (updateUser)
        next()
    })
}
