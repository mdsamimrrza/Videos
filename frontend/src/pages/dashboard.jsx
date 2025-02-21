import React from "react";
import Image from "./image";
import Video from "./video";

const Dashboard = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-700 p-6">
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
        {/* Video Box */}
        <div className="flex items-center justify-center bg-white rounded-md shadow-md p-4 w-full md:w-auto">
          <Video />
        </div>

        {/* Image Box
        <div className="flex items-center justify-center bg-white rounded-md shadow-md p-4 w-full md:w-auto">
          <Image />
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
