import axios from "axios";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN; 

export const generateVideo = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      REPLICATE_API_URL,
      {
        version: "your-model-version",
        input: { prompt },
      },
      {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const predictionId = response.data.id;
    let predictionResult;

    while (true) {
      const result = await axios.get(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
      });

      predictionResult = result.data;

      if (predictionResult.status === "succeeded") {
        break;
      } else if (predictionResult.status === "failed") {
        return res.status(500).json({ error: "Prediction failed." });
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); 
    }

    res.json({ videoUrl: predictionResult.output });
  } catch (error) {
    console.error("Error generating video:", error);
    res.status(500).json({
      error: "An error occurred while generating the video.",
    });
  }
};
