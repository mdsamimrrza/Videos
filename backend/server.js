// import express from 'express';
// import dotenv from 'dotenv';
// import connectDB from './config/db.js';
// import userRoutes from './routes/userRoutes.js';  
// import cors from 'cors';

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 7000;

// app.use(express.json());
// app.use(cors({ origin: process.env.CORS_ORIGIN }));

// app.use('/api', userRoutes);

// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server is running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Database connection error:', err);
//   });


// export default app;


import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Replicate from "replicate";
import axios from "axios";

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    // Step 1: Send prompt to Gemini
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const generatedText =
      geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({ message: "Failed to generate content from Gemini." });
    }

    // Step 2: Use Gemini-generated text as input for Replicate
    const replicateResponse = await replicate.run(
      "zsxkib/pyramid-flow:8e221e66498a52bb3a928a4b49d85379c99ca60fec41511265deec35d547c1fb",
      { input: { prompt: generatedText } }
    );

    if (!replicateResponse || !replicateResponse.length) {
      return res.status(500).json({ message: "Failed to generate video." });
    }

    res.json({ videoUrl: replicateResponse[0] });
  } catch (error) {
    console.error("Error generating video:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
