'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoIosPerson } from "react-icons/io";

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className } ) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: FaHome },
    { href: "/community", icon: FaPeopleGroup },
    { href: "/profile", icon: IoIosPerson },
  ];

  return (
    <footer className={`flex w-full p-4 text-black bg-white justify-around text-3xl ${className || ""}`}>
      {navItems.map(({ href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link 
            key={href} 
            href={href}
            className={isActive ? "text-accent-500" : ""}
          >
            <Icon />
          </Link>
        );
      })}
    </footer>
  );
}
