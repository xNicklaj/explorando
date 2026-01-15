'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoIosPerson } from "react-icons/io";
import { getCurrentUser } from "@/models/user";

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className } ) => {
  const pathname = usePathname();
  const [avatarDefault, setAvatarDefault] = useState<string | null>(null);
  const [avatarActive, setAvatarActive] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const navItems = [
    { href: "/", icon: FaHome },
    { href: "/community", icon: FaPeopleGroup },
    { href: "/me", icon: IoIosPerson },
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
    <footer className={`flex w-full p-4 text-black bg-white justify-around text-3xl ${className || ""}`}>
      {navItems.map(({ href, icon: Icon }) => {
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
            className={isActive ? "text-accent-500" : ""}
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
          </Link>
        );
      })}
    </footer>
  );
}
