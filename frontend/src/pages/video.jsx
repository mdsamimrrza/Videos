import React, { useState, useEffect } from "react";

const Video = () => {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generationMethod, setGenerationMethod] = useState("sync"); // sync or async
  const [predictionId, setPredictionId] = useState(null);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [progress, setProgress] = useState("");
  
  // Base URL for API requests
  const API_BASE_URL = "http://localhost:4000";
  
  // Poll for status updates when using async generation
  useEffect(() => {
    if (!predictionId) return;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/videos/status/${predictionId}`);
        const data = await response.json();
        
        setGenerationStatus(data.status);
        setProgress(data.progress || "");
        
        if (data.status === "completed") {
          setVideoUrl(data.videoUrl);
          setPredictionId(null);
        } else if (data.status === "failed") {
          setError(data.error || "Video generation failed");
          setPredictionId(null);
        } else {
          // Continue polling if still in progress
          setTimeout(checkStatus, 2000);
        }
      } catch (err) {
        setError("Error checking generation status");
        setPredictionId(null);
      }
    };
    
    checkStatus();
  }, [predictionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setVideoUrl(null);
    setPredictionId(null);
    setGenerationStatus(null);
    setProgress("");

    try {
      // Different endpoint based on generation method
      const endpoint = generationMethod === "sync" 
        ? `${API_BASE_URL}/api/videos/generate` 
        : `${API_BASE_URL}/api/videos/start-generation`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate video");
      }

      const data = await response.json();
      
      if (generationMethod === "sync") {
        // Synchronous generation returns video URL directly
        if (!data.videoUrl) throw new Error("No video URL received");
        setVideoUrl(data.videoUrl);
      } else {
        // Asynchronous generation returns a prediction ID for polling
        if (!data.predictionId) throw new Error("No prediction ID received");
        setPredictionId(data.predictionId);
        setGenerationStatus("processing");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (generationMethod === "sync") {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">AI Video Generator</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Describe your video
          </label>
          <textarea
            id="prompt"
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic shot of a futuristic city at sunset..."
            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        <div className="mb-4">
          <fieldset className="mt-2">
            <legend className="text-sm font-medium text-gray-700">Generation Method</legend>
            <div className="mt-1 flex space-x-4">
              <div className="flex items-center">
                <input
                  id="sync"
                  name="generationMethod"
                  type="radio"
                  checked={generationMethod === "sync"}
                  onChange={() => setGenerationMethod("sync")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sync" className="ml-2 text-sm text-gray-700">
                  Wait for result
                </label>
              </div>
              {/* <div className="flex items-center">
                <input
                  id="async"
                  name="generationMethod"
                  type="radio"
                  checked={generationMethod === "async"}
                  onChange={() => setGenerationMethod("async")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="async" className="ml-2 text-sm text-gray-700">
                  Generate in background
                </label>
              </div> */}
            </div>
          </fieldset>
        </div>
        
        <button
          type="submit"
          disabled={loading || predictionId !== null}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || predictionId !== null
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Processing..." : "Generate Video"}
        </button>
      </form>

      {predictionId && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Generation Status</h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              {generationStatus || "processing"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
          {progress && (
            <p className="mt-2 text-xs text-gray-500">{progress}</p>
          )}
        </div>
      )}

      {videoUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Your Generated Video</h2>
          <video 
            controls 
            autoPlay 
            loop 
            className="w-full rounded-md shadow-md border border-gray-200"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="mt-3">
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;