"use client";

import React from 'react';
import { motion } from "motion/react"
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter, usePathname } from "next/navigation";

import { useHaptic } from "react-haptic";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== "/";
  const { vibrate } = useHaptic();


  const handleClick = () => {
    vibrate();
    router.back();
  };

  return (
    <div className={`flex w-full p-5 text-black bg-white text-2xl ${className || ""} sticky top-0`}>
        {showBack && (
        <motion.button 
            className="cursor-pointer" 
            onClick={handleClick}
            whileTap={{ scale: 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <IoMdArrowRoundBack />
        </motion.button>
        )}
        <span className="justify-self-center text-center font-bold w-full">
            e<span className="text-accent-500">X</span>plorando
        </span>
    </div>
  );
};