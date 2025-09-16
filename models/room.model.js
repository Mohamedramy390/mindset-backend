// models/Room.js
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topic: { type: String, require: true },
  documents:{
    type: String,
    require: true
  }
});

export default mongoose.model("Room", roomSchema);
