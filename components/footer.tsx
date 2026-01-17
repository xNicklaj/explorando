'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoIosPerson } from "react-icons/io";
import { getCurrentUser } from "@/models/user";
import { FaCalendarDay } from "react-icons/fa";

import { useHaptic } from "react-haptic";

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className } ) => {
  const pathname = usePathname();
  const [avatarDefault, setAvatarDefault] = useState<string | null>(null);
  const [avatarActive, setAvatarActive] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const { vibrate } = useHaptic();

  const navItems = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/events", icon: FaCalendarDay, label: "Eventi" },
    { href: "/community", icon: FaPeopleGroup, label: "Community" },
    { href: "/me", icon: IoIosPerson, label: "Account" },
  ];

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const userData = await getCurrentUser();
        if (!alive) return;

        const avatar = userData?.Avatar;
        if (Array.isArray(avatar)) {
          if (avatar[0]) setAvatarDefault(avatar[0]);
          if (avatar[1]) setAvatarActive(avatar[1]);
        }

        if (userData?.Username) {
          setCurrentUsername(userData.Username);
        }
      } catch (err) {
        console.error('Footer: failed to fetch user data', err);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <footer className={`flex w-full p-2 text-black bg-white justify-around text-3xl ${className || ""}`}>
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        const isProfile = href === "/me" || href === "/profile";
        
        // Check if we're on the current user's profile page or /me
        const isCurrentUserProfile = pathname === "/me" || 
          (currentUsername && pathname === `/profile/${currentUsername}`);
        
        const avatarSrc = isProfile
          ? (isCurrentUserProfile ? (avatarActive || avatarDefault) : avatarDefault)
          : null;
        return (
          <Link 
            key={href} 
            href={href}
            className={`flex flex-col items-center gap-1 ${isActive ? "text-accent-500" : "text-zinc-700"}`}
            onClick={() => vibrate()}
          >
            {isProfile && avatarSrc ? (
              <img 
                src={avatarSrc}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-zinc-300"
              />
            ) : (
              <Icon />
            )}
            <span className={`text-[11px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
          </Link>
        );
      })}
    </footer>
  );
}
