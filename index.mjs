import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose';
import {ERROR} from './utils/httpStatus.js'
import roomRouter from './router/room.route.js'
import userRouter from './router/user.route.js'
import myroomsRouter from './router/myrooms.route.js'
import path from 'path';
import { fileURLToPath } from 'url';

const uri = process.env.MONGO_URI;
mongoose.connect(uri).then(() => {
    console.log("Mongo Server Connected")
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;



// CORS configuration
app.use(cors({
  // You must list the EXACT URLs of your frontend here
  origin: ["http://localhost:3000", "https://mindset-ai.netlify.app"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true 
}));

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/rooms', roomRouter)
app.use('/api/myrooms', myroomsRouter)
app.use('/api/users', userRouter)
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ status: err.statusText || ERROR ,msg: err.message})
})

app.listen(PORT, () => {
    console.log("server running")
})