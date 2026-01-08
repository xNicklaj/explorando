import React from 'react';
import Image from 'next/image';
import { motion } from "motion/react"
import Link from 'next/link';

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
    return (
        <Link href={linkUrl || ''}>
            <motion.button 
            className="text-black flex flex-col cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            >
                <Image src={imageUrl || ''} alt={title} width={250} height={300} className="bg-gray-400 m-2 text-white rounded-xl w-[250px] h-[300px] object-cover"/>
                <span className="text-left px-3 pb-2 text-xl">{title}</span>
            </motion.button>
        </Link>
);
};
