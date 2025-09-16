import { validationResult } from "express-validator";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import Room from "../models/room.model.js";
import {ERROR, SUCCESS} from '../utils/httpStatus.js'
import AppError from "../utils/appError.js";
import { uploadFile } from "../utils/googleApi.js";

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
        res.json({status: SUCCESS, data: {room:newRoom}})
    }
)

export {
    getAllRooms,
    createRoom
}