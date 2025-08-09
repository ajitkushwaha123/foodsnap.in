"use client";
import React, { Suspense } from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-all duration-300 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-full md:w-[35%] flex items-center justify-center px-2 md:px-6 bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-none transition-colors duration-300">
        <div className="max-w-md w-full">
          <Suspense
            fallback={<div className="text-center py-10">Loading...</div>}
          >
            {children}
          </Suspense>
        </div>
      </div>

      <div className="hidden md:block md:w-[65%] relative overflow-hidden">
        <video
          className="w-full h-full object-cover absolute inset-0 opacity-90"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/dashboard-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent dark:from-gray-900/60"></div>
      </div>
    </div>
  );
};

export default Layout;
