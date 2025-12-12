import { PdfReader } from "pdfreader";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HU_API_KEY);

/**
 * 1. Extract text from LOCAL PDF file path
 */
export async function extractTextFromPDF(pdfPath) {
  return new Promise((resolve, reject) => {
    let text = "";
    new PdfReader().parseFileItems(pdfPath, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(text); // finished
      else if (item.text) text += item.text + " ";
    });
  });
}

/**
 * 2. Generate Embedding using HfInference SDK
 */
export async function generateEmbedding(text) {
  try {
    console.log("🧠 Generating embedding via HfInference...");

    // Using featureExtraction for embeddings
    const output = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });

    // The SDK typically returns the array directly for single input
    if (output && (Array.isArray(output) || output.length > 0)) {
      console.log("✅ Successfully generated embedding");
      // Ensure we handle nested arrays if they occur [ [0.1, ...] ]
      if (Array.isArray(output[0])) {
        return output[0];
      }
      return output;
    }

    throw new Error("Empty response from AI model");

  } catch (error) {
    console.error("❌ AI Model Failed:", error.message);
    throw new Error("AI Service is currently overloaded or unavailable. Please try again in a moment.");
  }
}

/**
 * 3. Full pipeline
 */
export async function processPDFEmbedding(pdfPath) {
  const text = await extractTextFromPDF(pdfPath);
  const embedding = await generateEmbedding(text);
  return { text, embedding };
}

