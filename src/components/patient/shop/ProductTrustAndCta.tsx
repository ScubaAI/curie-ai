// src/components/patient/shop/ProductTrustAndCta.tsx
import React from 'react';
import { Truck, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductTrustAndCtaProps {
    clipPaymentUrl?: string;
    affiliateUrl?: string;
}

export default function ProductTrustAndCta({ clipPaymentUrl, affiliateUrl }: ProductTrustAndCtaProps) {
    const trustItems = [
        { icon: <Truck size={18} className="text-emerald-500" />, text: 'Envío Gratis (24-48h)' },
        { icon: <ShieldCheck size={18} className="text-emerald-500" />, text: 'Garantía de 2 años' },
        { icon: <RefreshCw size={18} className="text-emerald-500" />, text: '30 días de satisfacción' }
    ];

    return (
        <div className="space-y-8 bg-slate-900/20 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
            <div className="space-y-4">
                {trustItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        {item.icon}
                        <span>{item.text}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clipPaymentUrl && (
                    <a
                        href={clipPaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2"
                    >
                        Comprar ahora
                    </a>
                )}
                {affiliateUrl && (
                    <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                    >
                        Ver en sitio oficial <ExternalLink size={16} />
                    </a>
                )}
            </div>

            <p className="text-center text-xs text-slate-500">
                Al comprar recibes un código Curie para vincular tu dispositivo instantáneamente.
            </p>
        </div>
    );
}
