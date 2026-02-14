// src/components/patient/shop/ProductSpecsAccordion.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Info } from 'lucide-react';
import { ProductFeature } from '@/lib/shop/types';

interface ProductSpecsAccordionProps {
    specs: Record<string, string>;
    features: ProductFeature[];
}

export default function ProductSpecsAccordion({ specs, features }: ProductSpecsAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const sections = [
        {
            title: 'Características principales',
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
                            <div className="w-10 h-10 rounded-xl bg-cyan-950/50 flex items-center justify-center text-cyan-400 shrink-0">
                                <Check size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{feature.label}</p>
                                <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: 'Especificaciones técnicas',
            content: (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-950/60 rounded-2xl border border-slate-800/50">
                    {Object.entries(specs).map(([key, value]) => (
                        <div key={key}>
                            <span className="text-xs uppercase text-slate-500 block mb-1">{key}</span>
                            <p className="text-slate-200 font-medium">{value}</p>
                        </div>
                    ))}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            {sections.map((section, idx) => (
                <div key={idx} className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/20 backdrop-blur-xl">
                    <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
                    >
                        <span className="text-xl font-bold text-white">{section.title}</span>
                        <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {openIndex === idx && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="p-6 pt-0 border-t border-slate-800/50">
                                    {section.content}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
