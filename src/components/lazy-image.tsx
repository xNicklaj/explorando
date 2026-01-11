'use client';

import Image, { ImageProps } from 'next/image';
import { motion } from "motion/react";
import { useState } from 'react';

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
    className?: string;
}

export function LazyImage({ className = '', alt, ...props }: LazyImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
                {...props}
                alt={alt}
                loading="lazy"
                className={className}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}
