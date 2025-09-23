
import express from 'express'
import { createRoom, getAllRooms, getRoomsById } from '../controllers/roomController.js';
import { addRoomValidation } from '../middlewares/roomMiddleware.js';
import upload from '../middlewares/upload.js';
import verifyToken from '../middlewares/verifyToken.js';
import allowdTo from '../middlewares/allowdTo.js';
import userRoles from '../utils/userRoles.js';

const router = express.Router(); 

router.route('/')
    .get(verifyToken,getRoomsById)
    .post(verifyToken , allowdTo(userRoles.TEACHER) ,upload.single("file"),addRoomValidation,createRoom)


export default router;