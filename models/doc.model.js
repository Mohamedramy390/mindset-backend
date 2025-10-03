import mongoose from "mongoose";

const docSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    content: {
      type: String,
      required: true, // extracted text
    },
    embedding: {
      type: [Number], // array of floats
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "documents" }
);

docSchema.index({ embedding: "vector" }); // <-- enables MongoDB vector search

const Document = mongoose.model("Doc", docSchema);

export default Document;
