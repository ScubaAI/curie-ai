// src/components/patient/shop/ProductGallery.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <div className="space-y-6">
            <div className="relative aspect-square rounded-3xl bg-slate-900/40 border border-slate-800 overflow-hidden flex items-center justify-center backdrop-blur-xl">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedImage}
                        src={images[selectedImage]}
                        alt={name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-[80%] h-auto object-contain p-4"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-product.png'; }}
                    />
                </AnimatePresence>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === idx ? 'border-cyan-500 shadow-lg shadow-cyan-900/40' : 'border-slate-800 hover:border-slate-600'
                            }`}
                    >
                        <img src={img} alt={`${name} ${idx}`} className="w-full h-full object-contain p-2" />
                    </button>
                ))}
            </div>
        </div>
    );
}
