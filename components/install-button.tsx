"use client";

import React from 'react';
import { motion } from "motion/react"
import { MdInstallMobile } from "react-icons/md";

interface InstallButtonProps {
  onClick?: () => void;
  className?: string;
}

export const InstallButton: React.FC<InstallButtonProps> = ({ onClick, className }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`flex bg-white m-4 text-black text-xl p-4 rounded cursor-pointer justify-center justify-items-center ${className}`}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "tween" }}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <MdInstallMobile className="mr-2"/> Installa App
    </motion.button>
  );
};

