"use client";
import React from "react";
import CountdownTimer from "./CountdownTimer";

const Offer = () => {
  return (
    <div className="bg-primary mb-6 dark:bg-[#10101a] transition-colors duration-300 flex text-center md:text-start justify-center w-full font-poppins text-white dark:text-gray-100 rounded-md md:h-[120px] shadow-md">
      <div className="px-5 py-4 w-full md:flex justify-between items-center font-normal">
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <p className="text-[22px] font-semibold text-white dark:text-gray-100">
            🔥 Limited-time deal:
          </p>
          <p className="mt-2 text-sm md:text-base text-white/90 dark:text-gray-300">
            Don’t miss big discounts + <strong>2 extra months FREE</strong> with
            a 48-month plan
          </p>
        </div>

        <div className="w-full md:w-1/2 mt-4 md:mt-0 flex justify-center md:justify-end">
          <CountdownTimer />
        </div>
      </div>
    </div>
  );
};

export default Offer;
