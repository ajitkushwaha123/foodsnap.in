"use client";
import React, { useState, useEffect } from "react";

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date("2025-08-05") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div>
      <div className="flex text-white items-center justify-center w-full gap-2 md:gap-4 count-down-main">
        <div className="timer border-2 border-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-md w-16">
          <div className="">
            <h3 className="countdown-element text-white days font-manrope font-semibold text-lg md:text-2xl text-center">
              {timeLeft.days}
            </h3>
          </div>
          <p className="text-sm font-normal mt-1 text-center w-full">days</p>
        </div>
        <h3 className="font-manrope font-semibold text-lg md:text-2xl">:</h3>
        <div className="timer border-2 border-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-md w-16">
          <div className="">
            <h3 className="countdown-element hours font-manrope font-semibold text-lg md:text-2xl text-center">
              {timeLeft.hours}
            </h3>
          </div>
          <p className="text-sm font-normal mt-1 text-center w-full">hours</p>
        </div>
        <h3 className="font-manrope font-semibold text-lg md:text-2xl">:</h3>
        <div className="timer border-2 border-white px-2 md:px-2 py-0.5 md:py-1 rounded-md w-16">
          <div className="flex justify-center items-center flex-col">
            <h3 className="countdown-element minutes font-manrope font-semibold text-lg md:text-2xl text-center">
              {timeLeft.minutes}
            </h3>
          </div>
          <p className="text-sm font-normal mt-1 text-center w-full">min</p>
        </div>
        <h3 className="font-manrope font-semibold text-lg md:text-2xl">:</h3>
        <div className="timer border-2 border-white px-2 md:px-2 rounded-md py-0.5 md:py-1 w-16">
          <div className="">
            <h3 className="countdown-element seconds font-manrope font-semibold text-lg md:text-2xl text-center">
              {timeLeft.seconds}
            </h3>
          </div>
          <p className="text-sm font-normal mt-1 text-center w-full">sec</p>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
