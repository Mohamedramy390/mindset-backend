
import express from 'express'
import { createRoom, enrollToRoom, getAllRooms, question, getRoomById, deleteRoom } from '../controllers/roomController.js';
import { addRoomValidation } from '../middlewares/roomMiddleware.js';
import upload from '../middlewares/upload.js';
import verifyToken from '../middlewares/verifyToken.js';
import allowdTo from '../middlewares/allowdTo.js';
import userRoles from '../utils/userRoles.js';

const router = express.Router(); 

router.route('/')
    .get(verifyToken,allowdTo(userRoles.STUDENT) ,getAllRooms)


router.route('/:id/enroll')
    .post(verifyToken, allowdTo(userRoles.STUDENT) ,enrollToRoom)


router.route('/:id')
    .post(verifyToken, allowdTo(userRoles.STUDENT), question)
    .get(verifyToken, getRoomById)
    .delete(verifyToken, allowdTo(userRoles.TEACHER), deleteRoom)
    


export default router;