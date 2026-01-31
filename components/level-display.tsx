'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useHaptic } from 'react-haptic';
import { toast } from 'sonner';
import { getLevelInfo } from '@/lib/level';

interface LevelDisplayProps {
  xp: number;
  size?: number;
}

export default function LevelDisplay({ xp, size = 64 }: LevelDisplayProps) {
  const levelInfo = getLevelInfo(xp);
  const [isVisible, setIsVisible] = useState(false);
  const { vibrate } = useHaptic();

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleTap = () => {
    vibrate();
    const remainingXp = levelInfo.currentLevelXp - levelInfo.currentXp;
    toast(`${levelInfo.currentXp} / ${levelInfo.currentLevelXp} XP, ${remainingXp} XP rimanenti per il prossimo livello`);
  };

  const circumference = 2 * Math.PI * ((size - 8) / 2); // Subtract padding/border width
  const fillPercentage = levelInfo.progress;
  const strokeDashoffset = circumference * (1 - fillPercentage);

  return (
    <motion.div
      className="flex items-center justify-center relative cursor-pointer  rounded-full"
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.9 }}
      onClick={handleTap}
    >
      {/* SVG for progress circle border */}
      <svg
        className="absolute"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Gray background circle (unfilled portion) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-300"
        />
        
        {/* Orange progress circle (filled portion) */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-accent-500"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isVisible ? { strokeDashoffset: strokeDashoffset } : { strokeDashoffset: circumference }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: 0.2,
          }}
          style={{
            transformOrigin: `${size / 2}px ${size / 2}px`,
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>

      {/* Inner content */}
      <div className="flex items-center justify-center w-full h-full text-accent-500 flex-col">
        <div className="text-xs font-semibold leading-tight">LIV</div>
        <div className="text-2xl font-bold leading-tight">{levelInfo.level}</div>
      </div>

      {/* Tooltip showing XP progress */}
      <motion.div
        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        whileHover={{ opacity: 1, y: -5 }}
        transition={{ duration: 0.2 }}
      >
        {levelInfo.currentXp} / {levelInfo.currentLevelXp} XP
      </motion.div>
    </motion.div>
  );
}
