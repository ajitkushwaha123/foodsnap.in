"use client";
import React from "react";
import CountdownTimer from "./CountdownTimer";

const Offer = () => {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e0f1a] shadow-sm dark:shadow-md mb-6 transition-colors duration-300 w-full font-poppins">
      <div className="px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-start md:text-left md:w-1/2 space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            🔥 Limited-time deal:
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Get access to our premium collections of images at a special price! This offer
            is valid for a limited time only.
          </p>
        </div>

        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <CountdownTimer />
        </div>
      </div>
    </div>
  );
};

export default Offer;
