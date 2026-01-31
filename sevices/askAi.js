import { HfInference } from "@huggingface/inference";
import axios from "axios";
import Doc from "../models/doc.model.js"; 
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Initialize Hugging Face for Embeddings only
const hf = new HfInference(process.env.HU_API_KEY);
const PYTHON_URL = process.env.AI_SERVICE_URL || "http://localhost:5001"; 

/**
 * Orchestrates the RAG flow: 
 * Node (Embed/Search) -> Python (Generate Answer)
 */
export async function askAI(query, roomId) {
  try {
    console.log(`[askAI] Processing query: "${query}" for Room: ${roomId}`);

    const roomObjectId = new mongoose.Types.ObjectId(roomId);

    // 1. Generate Embedding LOCALLY in Node
    // We use the same model here as we did for ingestion
    const queryEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: query,
    });

    // 2. Vector Search in MongoDB Atlas
    const results = await Doc.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", 
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 3,
          // ✅ Filtering by Room ID ensures users only see their own notes
          filter: { roomId: roomObjectId } 
        },
      },
      {
        $project: { content: 1, score: { $meta: "vectorSearchScore" } } 
      }
    ]);

    if (!results.length) {
      console.log("[askAI] No matching documents found.");
      return "I couldn't find any relevant information in the lecture notes to answer this.";
    }

    // 3. Build Context String from found docs
    const context = results.map(doc => doc.content).join("\n\n");

    // 4. Send to Python Flask for "Llama 3.1 Reasoning"
    const response = await axios.post(`${PYTHON_URL}/generate`, {
      query: query,
      context: context
    });

    return response.data.answer;

  } catch (err) {
    console.error("Error in askAI:", err.message);
    // Return a friendly error so the frontend doesn't crash
    return "Sorry, I am having trouble connecting to the AI brain right now.";
  }
}

/**
 * Extracts topics by sending text to Python
 */
export async function getTopicsAI(text) {
  try {
    const response = await axios.post(`${PYTHON_URL}/topics`, {
      context: text,
    });
    return response.data.topics;
  } catch (err) {
    console.error("Error in getTopicsAI:", err.message);
    return []; // Return empty array on failure
  }
}

/**
 * Categorizes query by sending data to Python
 */
export async function categorizeQueryAI(query, topics) {
  try {
    const response = await axios.post(`${PYTHON_URL}/categorize`, {
      query,
      topics,
    });
    return response.data.related_topic;
  } catch (err) {
    console.error("Error in categorizeQueryAI:", err.message);
    return "General"; // Fallback topic
  }
}