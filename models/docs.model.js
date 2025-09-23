import mongoose from "mongoose";

const docsSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Room",
    required: true
  },
  chunkIndex: {
    type: Number, 
    required: true
  },
  text: {
    type: String, 
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Doc", docsSchema);
