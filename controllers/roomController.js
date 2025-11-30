import { validationResult } from "express-validator";
import path from "path";
import fs from "fs";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import Room from "../models/room.model.js";
import { ERROR, SUCCESS } from '../utils/httpStatus.js'
import AppError from "../utils/appError.js";
import User from '../models/user.model.js';
import Doc from '../models/doc.model.js';
import { processPDFEmbedding } from "../utils/pdfEmbedding.js";
import { askAI, categorizeQueryAI, getTopicsAI } from "../sevices/askAi.js";




const getAllRooms = asyncWrapper(
  async (req, res) => {
    const rooms = await Room.find({}, { '__v': false });
    res.json({ status: SUCCESS, data: { rooms } })
  }
)

const createRoom = asyncWrapper(async (req, res, next) => {
  // ✅ 1. Validate request input
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return next(new AppError(err.array()[0].msg, 400, ERROR));
  }

  // ✅ 2. Ensure file is uploaded
  if (!req.file || !req.file.path) {
    return next(new AppError("No file uploaded", 400, ERROR));
  }

  let newRoom = null;

  try {
    const absolutePath = path.resolve(req.file.path);
    console.log("📂 Uploaded file:", absolutePath);

    if (!fs.existsSync(absolutePath)) {
      return next(new AppError(`File not found at path: ${absolutePath}`, 500, ERROR));
    }

    // ✅ 3. Process PDF to get text + embedding
    const { text, embedding } = await processPDFEmbedding(absolutePath);
    if (!text || !embedding) {
      return next(new AppError("Failed to process uploaded PDF file", 500, ERROR));
    }

    // ✅ 4. Create Room (initial)
    // We create it first without topicQuestionCount
    newRoom = new Room({
      ...req.body,
      documents: req.file.path,
    });
    await newRoom.save(); // Save to get newRoom._id

    // ✅ 5. Create associated Doc record
    const doc = new Doc({
      roomId: newRoom._id,
      content: text,
      embedding,
      createdAt: new Date(),
    });
    await doc.save(); // <-- Document is saved here

    console.log("✅ Embedding saved for room:", newRoom._id);

    // ✅ 6. Get AI-generated topics (AFTER saving the doc)
    const topics = await getTopicsAI(text);
    console.log("🧠 Topics detected:", topics);

    // ✅ 7. Initialize topicQuestionCount safely
    const initialTopicCounts = Array.isArray(topics)
      ? topics.reduce((acc, topic) => ({ ...acc, [topic]: 0 }), {})
      : {};

    // ✅ 8. Update Room with topics and get the final version
    const updatedRoom = await Room.findByIdAndUpdate(
      newRoom._id,
      { $set: { topicQuestionCount: initialTopicCounts } },
      { new: true } // 'new: true' returns the modified document
    );

    // ✅ 9. Link room to the teacher’s account
    const teacherId = req.curUser?.id;
    if (teacherId) {
      await User.findByIdAndUpdate(
        teacherId,
        { $push: { rooms: updatedRoom._id } }, // Use updatedRoom._id
        { new: true }
      );
    }

    // ✅ 10. Send response
    res.status(201).json({
      status: SUCCESS,
      data: { room: updatedRoom }, // Send the fully updated room
    });
  } catch (error) {
    console.error("❌ Error creating room:", error);
    // If something failed, try to clean up the room if it was created
    if (newRoom && newRoom._id) {
      await Room.findByIdAndDelete(newRoom._id);
    }
    return next(new AppError(error.message, 500, ERROR));
  }
});

const getRoomsById = asyncWrapper(
  async (req, res, next) => {
    const id = req.curUser.id;
    const user = await User.findById(id);
    const rooms = await Room.find({ _id: { $in: user.rooms } })
    res.json({ status: SUCCESS, data: { rooms } })
  }
)

const getRoomById = asyncWrapper(
  async (req, res, next) => {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);

    if (!room) {
      const e = new AppError("Room not found", 404, ERROR)
      return next(e);
    }

    res.json({ status: SUCCESS, data: { room } })
  }
)

const enrollToRoom = asyncWrapper(
  async (req, res, next) => {
    const roomId = req.params.id;
    const studentId = req.curUser.id;
    const student = await User.findById(studentId);

    if (student.rooms.includes(roomId)) {
      return res.status(400).json({ status: SUCCESS, message: "Already enrolled" })
    }
    await User.findByIdAndUpdate(
      studentId,
      { $push: { rooms: roomId } },
      { new: true }
    );
    res.status(200).json({ status: SUCCESS, message: "Enrolled successfully" })
  }
)

const question = async (req, res) => {
  const roomId = req.params.id;
  const query = req.body.query;
  const doc = await Doc.findOne({ roomId });
  const room = await Room.findById(roomId)
  const topics = Array.from(room.topicQuestionCount.keys())
  const aiResponse = await askAI(query, doc.embedding)
  const topic = await categorizeQueryAI(query, topics)
  console.log("TOPIC:", topic)

  // Increment the topic question count in the room
  await Room.findByIdAndUpdate(
    roomId,
    { $inc: { [`topicQuestionCount.${topic}`]: 1 } },
    { new: true }
  );

  res.status(200).json({ status: SUCCESS, message: aiResponse })
}

const deleteRoom = asyncWrapper(async (req, res, next) => {
  const roomId = req.params.id;

  // 1. Find and delete the room from the database
  const room = await Room.findByIdAndDelete(roomId);

  // 2. If no room is found, send a 404 error
  if (!room) {
    return next(new AppError("Room not found", 404, ERROR));
  }

  // 3. Delete the associated Doc (embedding)
  await Doc.findOneAndDelete({ roomId: roomId });

  // 4. Remove the room reference from all users (students and teacher)
  await User.updateMany(
    { rooms: roomId }, // Find all users who have this room
    { $pull: { rooms: roomId } } // Remove the roomId from their 'rooms' array
  );

  // 5. Delete the physical file from the server
  try {
    if (room.documents) { // Check if a file path exists
      await fs.unlink(room.documents);
      console.log(`Deleted file: ${room.documents}`);
    }
  } catch (err) {
    // Log if file deletion fails, but don't block the response
    // The database entries are more critical.
    console.error("Failed to delete room file:", err.message);
  }

  // 6. Send a success response
  res.status(200).json({ status: SUCCESS, data: null, message: "Room deleted successfully" });
});

export {
  getAllRooms,
  createRoom,
  getRoomsById,
  enrollToRoom,
  question,
  getRoomById,
  deleteRoom,
}