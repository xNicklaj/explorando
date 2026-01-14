'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoIosPerson } from "react-icons/io";
import { db, rtdb } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, get } from "firebase/database";

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className } ) => {
  const pathname = usePathname();
  const [avatarDefault, setAvatarDefault] = useState<string | null>(null);
  const [avatarActive, setAvatarActive] = useState<string | null>(null);

  const navItems = [
    { href: "/", icon: FaHome },
    { href: "/community", icon: FaPeopleGroup },
    { href: "/me", icon: IoIosPerson },
  ];

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const userIdSnap = await get(ref(rtdb, 'userid'));
        if (!userIdSnap.exists()) return;
        const userId = userIdSnap.val();
        if (typeof userId !== 'string' || !userId) return;

        const userDoc = await getDoc(doc(db, 'User', userId));
        if (!alive || !userDoc.exists()) return;
        const data = userDoc.data() as any;
        const avatar = data?.Avatar;
        if (Array.isArray(avatar) && avatar.length >= 2) {
          const first = typeof avatar[0] === 'string' ? avatar[0].trim() : '';
          const second = typeof avatar[1] === 'string' ? avatar[1].trim() : '';
          if (first) setAvatarDefault(first);
          if (second) setAvatarActive(second);
        } else if (typeof avatar === 'string' && avatar.trim().length > 0) {
          const trimmed = avatar.trim();
          setAvatarDefault(trimmed);
          setAvatarActive(trimmed);
        }
      } catch (err) {
        console.error('Footer: failed to fetch avatar', err);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <footer className={`flex w-full p-4 text-black bg-white justify-around text-3xl ${className || ""}`}>
      {navItems.map(({ href, icon: Icon }) => {
        const isActive = pathname === href;
        const isProfile = href === "/me" || href === "/profile";
        const avatarSrc = isProfile
          ? (isActive ? (avatarActive || avatarDefault) : avatarDefault)
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
