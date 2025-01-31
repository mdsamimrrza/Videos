import React, { useState } from "react";

const Video = () => {
  const [prompt, setPrompt] = useState("");
  const [responseUrl, setResponseUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseUrl(null);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate video.");
      }

      const data = await response.json();
      if (!data.videoUrl) throw new Error("No video URL received.");

      setResponseUrl(data.videoUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Generate Video</h1>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Enter Prompt
          </label>
          <textarea
            id="prompt"
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to generate"
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white ${loading ? "bg-gray-500" : "bg-indigo-500 hover:bg-indigo-600"}`}
        >
          {loading ? "Generating..." : "Generate Video"}
        </button>
      </form>

      {responseUrl && (
        <div className="mt-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Generated Video</h2>
          <video controls className="w-full rounded-md shadow-md">
            <source src={responseUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default Video;
