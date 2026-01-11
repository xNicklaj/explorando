'use client';

import React from 'react';
import { motion } from "motion/react"
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { LazyImage } from './lazy-image';

interface ImageCarouselProps {
    images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
    const [emblaRef] = useEmblaCarousel({ loop: true });

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex">
                {images.map((imageUrl, index) => (
                    <motion.div key={index} className="embla__slide flex-[0_0_100%] min-w-0"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <LazyImage
                            src={imageUrl}
                            alt={`Slide ${index + 1}`}
                            width={800}
                            height={400}
                            className="w-full h-64 object-cover"
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
