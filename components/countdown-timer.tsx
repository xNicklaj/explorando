"use client";

import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetUnixEpoch: number; // Unix timestamp in seconds
  onComplete?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetUnixEpoch,
  onComplete,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const difference = targetUnixEpoch * 1000 - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true,
        });
        if (onComplete) onComplete();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isComplete: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetUnixEpoch, onComplete]);

  const padZero = (num: number) => String(num).padStart(2, "0");

  return (
    <div className={`text-center text-white p-2 rounded-3xl text-s font-bold bg-accent-500 border border-gray-200 shadow-sm ${className || ""}`}>
      {padZero(timeRemaining.days)}:{padZero(timeRemaining.hours)}:
      {padZero(timeRemaining.minutes)}:{padZero(timeRemaining.seconds)}{" "}
       al prossimo refresh
    </div>
  );
};
