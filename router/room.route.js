
import express from 'express'
import { createRoom, getAllRooms } from '../controllers/roomController.js';
import { addRoomValidation } from '../middlewares/roomMiddleware.js';
import upload from '../middlewares/upload.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router(); 

router.route('/')
    .get(getAllRooms)
    .post(verifyToken ,upload.single("file"),addRoomValidation,createRoom)


export default router;