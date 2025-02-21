// File: controllers/replicateController.js
import axios from "axios";
import dotenv from "dotenv";
import Replicate from "replicate";
import fs from "fs";
import path from "path";


dotenv.config();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use a valid model version ID; here we default to "christophy/stable-video-diffusion:43b6ee89"
// (you can override via your .env by setting REPLICATE_MODEL_VERSION)
const REPLICATE_MODEL_VERSION = process.env.REPLICATE_MODEL_VERSION 
// "christophy/stable-video-diffusion:43b6ee89";


// Helper function to enhance prompts using Gemini
async function enhancePromptWithGemini(prompt) {
  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Enhance this video generation prompt with more visual details in one line : ${prompt}`,
              },
            ],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const enhancedText =
      geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    console.log("Enhanced prompt:", enhancedText);
    return enhancedText;
  } catch (error) {
    console.error("Error enhancing prompt with Gemini:", error);
    // Fall back to the original prompt if enhancement fails
    return prompt;
  }
}

// Helper function to convert a ReadableStream to a string.
// Helper to convert a web ReadableStream into a Node.js Buffer.
async function streamToBuffer(stream) {
  const reader = stream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // value is a Uint8Array; convert it into a Buffer.
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export const generateVideo = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Step 1: Enhance the prompt with Gemini.
    const enhancedPrompt = await enhancePromptWithGemini(prompt);

    // Step 2: Initialize the Replicate client.
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Step 3: Generate video using the Replicate client.
    const output = await replicate.run(
      "zsxkib/pyramid-flow:8e221e66498a52bb3a928a4b49d85379c99ca60fec41511265deec35d547c1fb",
      {
        input: {
          prompt: enhancedPrompt,
          duration: 5,
          frames_per_second: 8,
        },
      }
    );
    // console.log("Video generated successfully:", output);
    let videoUrl;

    // Check if output is a ReadableStream (binary video data).
    if (output && typeof output.getReader === "function") {
      // Convert the stream into a Buffer.
      const videoBuffer = await streamToBuffer(output);

      // Define a file name and path (make sure this directory is served statically).
      const videoFileName = `video_${Date.now()}.mp4`;
      // Adjust __dirname if you're using ES modules (or use process.cwd()).
const videoFilePath = path.join(process.cwd(), "..", "frontend", "public", "videos", videoFileName);
      // Write the binary data to the file.
      fs.writeFileSync(videoFilePath, videoBuffer);

      // Construct the URL where the video is accessible.
      // Ensure that the "public/videos" folder is correctly served by your server.
      videoUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/videos/${videoFileName}`;
    } else if (Array.isArray(output) && output.length) {
      // If output is already an array with a URL.
      videoUrl = output[0];
    } else {
      return res.status(500).json({ error: "No valid video output received" });
    }

    console.log("Video generated successfully. URL:", videoUrl);
    res.json({
      success: true,
      message: "Video generated successfully",
      videoUrl,
    });
  } catch (error) {
    console.error("Error generating video:", error.response?.data || error.message);
    res.status(500).json({
      error:
        error.response?.data?.detail ||
        "An error occurred while generating the video.",
    });
  }
};


// Alternative approach: Start video generation and immediately return the prediction ID
export const startVideoGeneration = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  try {
    const enhancedPrompt = await enhancePromptWithGemini(prompt);
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: REPLICATE_MODEL_VERSION,
        input: {
          prompt: enhancedPrompt,
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          motion_bucket_id: 40,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    const predictionId = response.data.id;
    res.json({
      success: true,
      message: "Video generation started",
      predictionId,
      statusUrl: `https://api.replicate.com/v1/predictions/${predictionId}`,
    });
  } catch (error) {
    console.error("Error starting video generation:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail ||
        "An error occurred while starting video generation.",
    });
  }
};

// Check video generation status given a prediction ID
export const checkVideoStatus = async (req, res) => {
  const { predictionId } = req.params;
  if (!predictionId) {
    return res.status(400).json({ error: "Prediction ID is required" });
  }
  try {
    const statusResponse = await axios.get(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
      }
    );
    const predictionResult = statusResponse.data;
    if (predictionResult.status === "succeeded") {
      return res.json({
        status: "completed",
        videoUrl: predictionResult.output[0],
      });
    } else if (predictionResult.status === "failed") {
      return res.status(500).json({
        status: "failed",
        error: predictionResult.error || "Prediction failed.",
      });
    }
    // Return current status and logs if still processing
    res.json({
      status: predictionResult.status,
      progress: predictionResult.logs,
    });
  } catch (error) {
    console.error("Error checking video status:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "An error occurred while checking video status.",
    });
  }
};
