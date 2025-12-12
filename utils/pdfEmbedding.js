import { PdfReader } from "pdfreader";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * 1. Extract text from LOCAL PDF file path
 * (This works perfectly with your new Hybrid/Multer workflow)
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
 * 2. Generate Embedding
 * REMOVED: The "fake" local embedding fallback.
 */
export async function generateEmbedding(text) {
  try {
    // Retry logic could be added here, but for now, we just call the API
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/intfloat/e5-small-v2",
      {
        inputs: text,
        options: { wait_for_model: true } // Important: waits if model is "cold"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HU_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.error) {
        throw new Error(`HF Error: ${response.data.error}`);
    }

    console.log("✅ Successfully generated embedding");
    
    // The API returns the array directly, or an array of arrays. 
    // Usually for 1 input, it's response.data (array of numbers) or response.data[0]
    // Check if it's flat or nested:
    const embedding = Array.isArray(response.data) ? response.data : null;
    
    // Handle case where API returns nested array [ [0.1, 0.2...] ]
    if (embedding && Array.isArray(embedding[0])) {
        return embedding[0];
    }
    return embedding;

  } catch (error) {
    console.error("❌ AI Model Failed:", error.message);
    
    // CRITICAL: Throw the error! 
    // Do not return fake data. Let the Controller catch this and tell the user "Try again".
    throw new Error("AI Service is currently overloaded or unavailable. Please try again in a moment.");
  }
}

/**
 * 3. Full pipeline
 */
export async function processPDFEmbedding(pdfPath) {
  const text = await extractTextFromPDF(pdfPath);
  
  // Clean text: Remove extra spaces and limit length
  // HF Free Tier often errors if text is > 2000-3000 chars
  const cleanText = text.replace(/\s+/g, " ").trim().slice(0, 2500);
  
  const embedding = await generateEmbedding(cleanText);
  return { text: cleanText, embedding };
}