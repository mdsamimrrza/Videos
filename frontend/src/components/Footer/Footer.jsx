import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        {/* Links */}
        {/* <div className="flex justify-center space-x-6 mb-4">
          <a
            href="/"
            className="text-white hover:text-gray-400 transition duration-200"
          >
            Home
          </a>
          <a
            href="/register"
            className="text-white hover:text-gray-400 transition duration-200"
          >
            Register
          </a>
          <a
            href="/login"
            className="text-white hover:text-gray-400 transition duration-200"
          >
            Login
          </a>
        </div> */}

        {/* Copyright */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} MyWebsite. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
