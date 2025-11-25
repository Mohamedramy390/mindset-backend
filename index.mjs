import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose';
import {ERROR} from './utils/httpStatus.js'
import roomRouter from './router/room.route.js'
import userRouter from './router/user.route.js'
import myroomsRouter from './router/myrooms.route.js'

const uri = process.env.MONGO_URI;
mongoose.connect(uri).then(() => {
    console.log("Mongo Server Connected")
})

const app = express();
const PORT = 4000;



// CORS configuration
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors());

app.use(express.json())
app.use("/uploads", express.static("uploads"));
app.use('/api/rooms', roomRouter)
app.use('/api/myrooms', myroomsRouter)
app.use('/api/users', userRouter)
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ status: err.statusText || ERROR ,msg: err.message})
})

app.listen(PORT, () => {
    console.log("server running")
})