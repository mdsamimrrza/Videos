import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import LandingPage from "./pages/landingPages.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Register from "./pages/register.jsx";
import Login from "./pages/Login.jsx";
import Layout from "./Layout.jsx";
import Video from "./pages/video.jsx";
import Image from "./pages/image.jsx"; // Import Image component

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> }, // Explicit root path
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "video", element: <Video /> },
      { path: "dashboard", element: <Dashboard /> }, // Lowercase path
      { path: "image", element: <Image /> }, // Lowercase path
    ],
  },
]);

// Render the app with the router
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
