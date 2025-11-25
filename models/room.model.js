// models/Room.js
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topic: { type: String, require: true },
  documents:{
    type: String,
    require: true
  },
  isEmbedded: {
    type: Boolean,
    default: false
  },
  embeddingMetadata: {
    chunksCount: { type: Number },
    textLength: { type: Number },
    processedAt: { type: Date },
    fileName: { type: String }
  },
  topicQuestionCount: {
    type: Map,
    of: Number,
    default: {}
  } 
}, {
  timestamps: true
});

export default mongoose.model("Room", roomSchema);
