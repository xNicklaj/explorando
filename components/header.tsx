"use client";

import React, { useEffect, useState } from 'react';
import { motion } from "motion/react"
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter, usePathname } from "next/navigation";

import { useHaptic } from "react-haptic";
import { getCurrentUser } from '@/models/user';
import { Button } from './custom-button';

import Image from 'next/image';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((u) => {
        if (mounted) {
          setCurrentUserId(u.Username);
          setPoints(u.Points);
        }
      })
      .catch(() => {
        // ignore errors; absence of ID will simply not hide the back button for profile
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Show back icon except for root, community, me, and the current user's profile
  const isRoot = pathname === "/";
  const isCommunity = pathname === "/community";
  const isMe = pathname === "/me";
  const isProfile = pathname.startsWith("/profile/");
  let showBack = !(isRoot || isCommunity || isMe);
  if (isProfile) {
    const parts = pathname.split("/");
    const profileId = parts.length >= 3 ? parts[2] : null;
    console.log(profileId, currentUserId);
    if (profileId && currentUserId && profileId === currentUserId) showBack = false;
  }
  const { vibrate } = useHaptic();


  const handleClick = () => {
    vibrate();
    router.back();
  };

  return (
    <div className={`relative flex flex-row w-full p-3 text-black bg-white text-2xl ${className || ""} sticky top-0`}>
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
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold">
            e<span className="text-accent-500">X</span>plorando
        </span>
        <div className="ml-auto">
          <Button href="/shop" className="bg-yellow-500 text-base px-2 py-1 border-yellow-700 border gap-0" layoutClass="flex justify-center align-center">
            <Image src="/token.png" alt="Token" width={24} height={24}/>
            {points}
          </Button>
        </div>
    </div>
  );
};