"use client";
import React, { useState, useEffect } from "react";

const CountdownTimer = () => {
  const CYCLE_DURATION_MS = 24 * 60 * 60 * 1000;

  const getCycleEndTime = () => {
    const now = new Date();
    const saved = localStorage.getItem("redis_countdown_end");

    if (saved) {
      const savedDate = new Date(saved);
      if (savedDate > now) return savedDate;
    }

    const nextEnd = new Date(now.getTime() + CYCLE_DURATION_MS);
    localStorage.setItem("redis_countdown_end", nextEnd.toISOString());
    return nextEnd;
  };

  const [endTime, setEndTime] = useState(getCycleEndTime());
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

  function getTimeLeft(endTime) {
    const now = new Date();
    const difference = endTime.getTime() - now.getTime();

    if (difference <= 0) {
      const newEnd = new Date(now.getTime() + CYCLE_DURATION_MS);
      localStorage.setItem("redis_countdown_end", newEnd.toISOString());
      setEndTime(newEnd);
      return getTimeLeft(newEnd);
    }

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const timeUnits = [
    { label: "hrs", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
    { label: "sec", value: timeLeft.seconds },
  ];

  return (
    <div className="w-full flex justify-center items-center py-6 px-4">
      <div className="flex items-center gap-2 md:gap-4">
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <div className="flex flex-col py-2 items-center justify-center w-16 md:w-20 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
              <div className="text-gray-900 dark:text-white font-semibold text-lg md:text-2xl">
                {unit.value.toString().padStart(2, "0")}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {unit.label}
              </div>
            </div>
            {index < timeUnits.length - 1 && (
              <div className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
                :
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
