import express from 'express'
import mongoose from 'mongoose'
import dotenv from "dotenv"
import userRoutes from './routes/user.route.js'
import userAuth from './routes/auth.route.js'
import postRoutes from './routes/post.route.js'
import commentRoute from './routes/comment.route.js'
import cookieParser from 'cookie-parser'
import path from 'path'



dotenv.config()

const app = express()

app.use(express.json())

app.use(cookieParser())


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log(error))


const __dirname = path.resolve()


app.listen(3000, () => {
    console.log('Server running on port 3000')
})

app.use('/api/auth', userAuth)
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)
app.use('/api/comment', commentRoute)


app.use(express.static(path.join(__dirname, '/client/dist')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
})


app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error'
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})