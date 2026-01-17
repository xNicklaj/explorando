import React from 'react';
import Image from 'next/image';
import { motion } from "motion/react"
import Link from 'next/link';
import { LazyImage } from './lazy-image';
import { useHaptic } from "react-haptic";

interface PreviewCardProps {
  title: string;
  imageUrl?: string;
  linkUrl?: string;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  title,
  imageUrl,
  linkUrl,
}) => {
    const { vibrate } = useHaptic();

    return (
        <Link href={linkUrl || ''}>
            <motion.div 
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => vibrate()}
            >
              <div className="relative w-full h-48">
                <LazyImage src={imageUrl || ''} alt={title} fill className="object-cover"/>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
              </div>
            </motion.div>
        </Link>
);
};
