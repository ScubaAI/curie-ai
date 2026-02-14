// src/components/patient/shop/RecommendedBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, HeartPulse } from 'lucide-react';
import { Product } from '@/lib/shop/types';

interface RecommendedBannerProps {
    products: Product[];
    patientGoals?: string[]; // Opcional: ej. ['bajar grasa', 'mejorar sueño', 'monitoreo cardíaco']
}

export default function RecommendedBanner({
    products = [],
    patientGoals = []
}: RecommendedBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Carousel automático suave cada 6s
    useEffect(() => {
        if (products.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [products.length]);

    if (products.length === 0) return null;

    const currentProduct = products[currentIndex];
    const nextProduct = products[(currentIndex + 1) % products.length];

    const goalsText = patientGoals.length > 0
        ? patientGoals.slice(0, 2).join(' y ')
        : 'alcanzar tus metas de salud';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="relative mb-16 p-8 lg:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 border border-cyan-800/30 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl"
        >
            {/* Glow radial dinámico */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.12)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.08)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
                {/* Izquierda: Mensaje personalizado */}
                <div className="space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-sm font-semibold uppercase tracking-widest backdrop-blur-md">
                        <HeartPulse className="w-5 h-5 animate-pulse text-emerald-400" />
                        Selección personalizada por Curie
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-cyan-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent leading-tight">
                        Eleva tu monitoreo hoy
                    </h2>

                    <p className="text-xl text-slate-200 leading-relaxed max-w-xl">
                        Basado en tu perfil actual, estos dispositivos son ideales para {goalsText}.
                        Sincronización perfecta, datos en tiempo real, transformación real.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/50 transition-all duration-300"
                    >
                        Ver recomendaciones completas
                        <ArrowRight className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Derecha: Carousel de productos recomendados */}
                <div className="relative flex items-center justify-center gap-8 lg:gap-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: -50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="flex flex-col items-center gap-4 p-6 bg-slate-950/60 rounded-2xl border border-cyan-800/30 backdrop-blur-xl shadow-xl hover:shadow-cyan-950/50 transition-shadow"
                        >
                            <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-xl overflow-hidden border border-slate-700/50">
                                <img
                                    src={currentProduct.image}
                                    alt={currentProduct.name}
                                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white">{currentProduct.name}</h3>
                                <p className="text-sm text-emerald-400 mt-1">
                                    ${currentProduct.priceMXN.toLocaleString('es-MX')} MXN
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Flecha + teaser del siguiente */}
                    <div className="hidden md:flex flex-col items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-900/50 hover:shadow-cyan-700/70 transition-all"
                        >
                            <ArrowRight className="w-8 h-8 text-white" />
                        </motion.button>
                        <span className="text-xs text-slate-500">Siguiente</span>
                    </div>

                    {/* Teaser del siguiente (opcional, visible en lg) */}
                    {products.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0.4 }}
                            animate={{ opacity: 0.4 }}
                            className="hidden lg:flex flex-col items-center gap-4 p-6 bg-slate-950/40 rounded-2xl border border-slate-800/30 backdrop-blur-md scale-90"
                        >
                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700/40">
                                <img
                                    src={nextProduct.image}
                                    alt={nextProduct.name}
                                    className="w-full h-full object-cover grayscale-[30%]"
                                />
                            </div>
                            <p className="text-xs text-slate-400 text-center">{nextProduct.name}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};