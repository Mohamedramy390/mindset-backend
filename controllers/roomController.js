import { validationResult } from "express-validator";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import Room from "../models/room.model.js";
import {ERROR, SUCCESS} from '../utils/httpStatus.js'
import AppError from "../utils/appError.js";
import User from '../models/user.model.js'


const getAllRooms = asyncWrapper(
    async (req, res) => {
        const rooms = await Room.find({}, {'__v':false});
        res.json({status: SUCCESS, data: {rooms}})
    }
)

const createRoom = asyncWrapper(
    async(req, res, next) => {
        const err = validationResult(req)
        if(!err.isEmpty()){
            const e = new AppError(err.array().at(0).msg, 400, ERROR)
            return next(e);
        }
        const newRoom = new Room({
            ...req.body,
            documents: req.file ? req.file.path : null
        })
        await newRoom.save();
        const teacherId = req.curUser.id;
        await User.findByIdAndUpdate(
        teacherId,
        { $push: { rooms: newRoom._id } },
        { new: true }
        );
        res.json({status: SUCCESS, data: {room:newRoom}})
    }
)

const getRoomsById = asyncWrapper(
    async(req, res, next) => {
        const id = req.curUser.id;
        const user = await User.findById(id);
        const rooms = await Room.find({_id:{ $in: user.rooms}}) 
        res.json({status: SUCCESS, data: {rooms}})
    }
)

const enrollToRoom = asyncWrapper(
    async (req, res, next) => {
        const roomId = req.params.id;
        const studentId = req.curUser.id;
        const student = await User.findById(studentId);
        
        if(student.rooms.includes(roomId)){
            return res.status(400).json({status: SUCCESS, message: "Already enrolled"})
        }
        await User.findByIdAndUpdate(
            studentId,
            { $push: { rooms: roomId } },
            { new: true }
        );
        res.status(200).json({status: SUCCESS, message: "Enrolled successfully"})
    }
)

const question = (req, res) => {
    // question - pdf
    // const response = ai(question - pdf)
    // res(response)
}
export {
    getAllRooms,
    createRoom,
    getRoomsById,
    enrollToRoom
}