"use client";

import Link from 'next/link';
import { motion } from 'motion/react';
import { useHaptic } from "react-haptic";

export const Button = ({ className, children, href, onClick, overrideBg, enabled, layoutClass }: { className?: string, children: React.ReactNode, href?: string, onClick?: () => void, overrideBg?: boolean, enabled?: boolean, layoutClass?: string }) => {
    const { vibrate } = useHaptic();
    
    return (
        <Link href={href || "#"} className={layoutClass || ""}>
            <motion.button 
                className={`flex flex-row items-center gap-2 ${overrideBg || false ? '' : 'bg-accent-500'} p-3 rounded-4xl justify-center w-full text-white ${className || ''}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    vibrate();
                    if (onClick) onClick();
                }}
                disabled={enabled === false}
            >
                {children}
            </motion.button>
        </Link>);
};