// src/components/patient/shop/FloatingSparkle.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function FloatingSparkle() {
    return (
        <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
            <Sparkles className="w-12 h-12 text-emerald-400 opacity-80" />
        </motion.div>
    );
}
