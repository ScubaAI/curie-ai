// src/components/patient/shop/ShopHero.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Sparkles } from 'lucide-react';

export default function ShopHero() {
    return (
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-center space-y-6 max-w-4xl mx-auto"
            >
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-sm font-medium backdrop-blur-md">
                    <HeartPulse className="w-5 h-5 animate-pulse" />
                    Exclusivo para miembros Curie
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-cyan-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent leading-tight">
                    Health Shop
                </h1>

                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                    Dispositivos de élite que no solo miden… transforman.
                    Cada uno sincroniza en tiempo real con tu dashboard Curie — más datos, más precisión, más poder sobre tu biología.
                </p>

                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center gap-3 px-6 py-3 mt-4 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-base font-medium"
                >
                    <Sparkles className="w-5 h-5" />
                    Recomendaciones personalizadas por tu perfil de salud
                </motion.div>
            </motion.div>
        </div>
    );
}
