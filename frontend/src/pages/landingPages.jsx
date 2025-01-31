import React from "react";
import { useNavigate } from "react-router-dom";
import demo from "../assets/demo.mp4";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-[#29c9ea] flex flex-col items-center">
      {/* <section className="py-20 text-center">
            <h2 className="mb-6 text-5xl font-bold text-gray-900">
              Turn Your Ideas into
              <span className="font-press-start text-green-600"> Videos</span>
              <br />
              with AI Magic
            </h2>
      </section> */}
      {/* Welcome Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full text-center mt-12">
        <h2 className="mb-6 text-5xl font-bold text-gray-900">
              Turn Your Ideas into
              <span className="font-press-start text-green-600"> Videos</span>
              <br />
              with AI Magic
            </h2>
        <p className="text-gray-700 text-lg mb-8">
          Join us to explore amazing features and unlock new opportunities.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            className="w-full md:w-auto bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
          <button
            className="w-full md:w-auto bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>

      {/* Video Section */}
      <section className="py-20 w-full">
        <h3 className="mb-12 text-center text-4xl font-semibold text-white">
          See It in Action
        </h3>
        <div className="mx-auto flex aspect-video max-w-2xl items-center justify-center rounded-lg bg-gray-800 shadow-lg">
          <video
            className="rounded-lg"
            controls
            src={demo} 
            autoPlay
            loop
          />
        </div>
        <p className="mt-4  text-xl  text-center text-red -100">
          This could be your AI-generated video!
        </p>
      </section>
    </div>
  );
}

export default LandingPage;
