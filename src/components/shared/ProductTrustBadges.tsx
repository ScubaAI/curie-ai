// src/components/shared/ProductTrustBadges.tsx
import React from 'react';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';

export const ProductTrustBadges = () => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-slate-800/50 text-xs text-slate-500">
            <div className="flex items-center gap-2">
                <Truck size={16} className="text-emerald-500" />
                <span>Envío 24-48 h</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Garantía 2 años</span>
            </div>
            <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-emerald-500" />
                <span>30 días devolución</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Curie Certified</span>
            </div>
        </div>
    );
};
