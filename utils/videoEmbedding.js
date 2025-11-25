import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Extract transcript from a YouTube video
 */
export async function extractTranscriptFromYouTube(youtubeUrl) {
  try {
    // fetchTranscript returns an array of { text, duration, offset }
    const transcriptItems = await YoutubeTranscript.fetchTranscript(youtubeUrl);
    
    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error("No transcript found for this video.");
    }

    // Combine all text parts into a single string
    const fullText = transcriptItems.map(item => item.text).join(' ');
    console.log("✅ Successfully extracted transcript.");
    return fullText;

  } catch (error) {
    console.error(`⚠️ Error fetching transcript: ${error.message}`);
    if (error.message.includes('subtitles are disabled')) {
      throw new Error("Could not get transcript. Subtitles are disabled for this video.");
    }
    throw new Error(`Failed to process ${youtubeUrl}: ${error.message}`);
  }
}

/**
 * Generate embedding from Hugging Face API using feature extraction
 * (This function is identical to your original one)
 */
export async function generateEmbedding(text) {
  try {
    // First try with a working embedding model
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/intfloat/e5-small-v2",
      {
        inputs: text,
        options: { 
          wait_for_model: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HU_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log("✅ Successfully generated embedding with e5-small-v2");
    return response.data[0];
    
  } catch (error) {
    console.log("⚠️ Primary model failed, using local embedding generation...");
    
    // Generate a deterministic embedding based on text content
    const embedding = generateLocalEmbedding(text);
    return embedding;
  }
}

/**
 * Generate a local deterministic embedding from text
 * (This function is identical to your original one)
 */
function generateLocalEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const embedding = new Array(384).fill(0);
  
  // Create embedding based on word characteristics
  words.forEach((word, wordIndex) => {
    for (let i = 0; i < word.length && i < embedding.length; i++) {
      const char = word.charCodeAt(i);
      const position = (wordIndex * 7 + i * 13) % embedding.length;
      embedding[position] += Math.sin(char / 127.0) * (1.0 / (wordIndex + 1)) * 0.1;
    }
  });
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
}

/**
 * Full pipeline: YouTube URL → Text → Embedding
 */
export async function processYouTubeEmbedding(youtubeUrl) {
  console.log(`Processing video: ${youtubeUrl}`);
  const text = await extractTranscriptFromYouTube(youtubeUrl);
  
  if (!text || text.length === 0) {
    throw new Error("No text to embed.");
  }

  const embedding = await generateEmbedding(text);
  return { text, embedding };
}


// --- Example Usage ---
/*
(async () => {
  try {
    // Example: A short video about React
    const videoUrl = "https://www.youtube.com/watch?v=bMknfKXIFA8"; 
    const result = await processYouTubeEmbedding(videoUrl);
    
    console.log("\n--- EMBEDDING ---");
    // Log the first 5 dimensions of the embedding
    console.log(result.embedding.slice(0, 5));
    
    console.log("\n--- TRANSCRIPT (first 200 chars) ---");
    console.log(result.text.substring(0, 200) + "...");

  } catch (error) {
    console.error(error.message);
  }
})();
*/