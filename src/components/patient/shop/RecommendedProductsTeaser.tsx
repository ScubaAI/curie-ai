// src/components/patient/shop/RecommendedProductsTeaser.tsx
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Loader2, Wifi, Bluetooth, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScoredProduct } from '@/lib/shop/getRecommendedProducts';
import { CurieIntegrationLevel } from '@/lib/shop/types';

interface RecommendedProductsTeaserProps {
    products: ScoredProduct[];
    isLoading?: boolean;
    patientName?: string;
}

// Mapeo de niveles de integración a UI
const integrationConfig: Record<CurieIntegrationLevel, {
    icon: typeof Wifi;
    label: string;
    color: string;
    bgColor: string;
    description: string;
}> = {
    native: {
        icon: Zap,
        label: 'Sync automático',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
        description: 'Datos en tiempo real'
    },
    api: {
        icon: RefreshCw,
        label: 'Sync diario',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20',
        description: 'Actualización diaria'
    },
    manual: {
        icon: Bluetooth,
        label: 'Registro manual',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        description: 'Ingresa tus datos'
    },
    planned: {
        icon: Wifi,
        label: 'Próximamente',
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20',
        description: 'En desarrollo'
    }
};

export function RecommendedProductsTeaser({
    products,
    isLoading = false,
    patientName
}: RecommendedProductsTeaserProps) {

    // Mensaje personalizado según el producto principal
    const headerMessage = useMemo(() => {
        if (products.length === 0) return 'Descubre dispositivos compatibles';

        const topProduct = products[0];
        const categoryMessages: Record<string, string> = {
            weight: patientName
                ? `${patientName}, tu progreso merece precisión`
                : 'Tu progreso merece precisión',
            sleep: 'La recuperación es donde ganas',
            heart: 'Prevención elegante, datos reales',
            general: 'Descubre lo que Curie puede hacer por ti'
        };

        return categoryMessages[topProduct.context.category] || categoryMessages.general;
    }, [products, patientName]);

    if (isLoading) {
        return (
            <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-64 bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-64 h-48 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            {/* Header con contexto */}
            <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        {headerMessage}
                    </h3>
                    {products[0]?.context.reason && (
                        <p className="text-sm text-slate-400 pl-8">
                            {products[0].context.reason}
                        </p>
                    )}
                </div>
                <Link
                    href="/shop"
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group"
                >
                    Ver todos
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Grid horizontal con snap */}
            <div className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
                {products.map((product, index) => {
                    const integration = integrationConfig[product.curieIntegration?.level || 'manual'];
                    const IntegrationIcon = integration.icon;
                    const isNew = product.isNew || (product.releaseDate &&
                        new Date(product.releaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="snap-start flex-shrink-0 w-72 group"
                        >
                            <Link
                                href={`/shop/${product.slug}`}
                                className="block bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-700/50 transition-all duration-300 shadow-md hover:shadow-cyan-950/40 hover:shadow-lg relative"
                            >
                                {/* Badge "Nuevo" - factor sorpresa */}
                                {isNew && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 right-2 z-10 px-2 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold rounded-full shadow-lg"
                                    >
                                        ✨ Nuevo
                                    </motion.div>
                                )}

                                {/* Imagen con overlay de contexto */}
                                <div className="relative h-36 overflow-hidden bg-slate-900/30">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Badges superiores */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {product.context.urgency === 'high' && (
                                            <span className="px-2 py-1 bg-rose-500/90 text-white text-xs font-medium rounded-full shadow-sm">
                                                Recomendado
                                            </span>
                                        )}
                                        {product.context.category === 'sleep' && (
                                            <span className="px-2 py-1 bg-indigo-500/90 text-white text-xs font-medium rounded-full shadow-sm">
                                                Sueño
                                            </span>
                                        )}
                                        {product.context.category === 'heart' && (
                                            <span className="px-2 py-1 bg-rose-400/90 text-white text-xs font-medium rounded-full shadow-sm">
                                                Cardio
                                            </span>
                                        )}
                                    </div>

                                    {/* Badge de integración Curie - parte inferior */}
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${integration.bgColor} backdrop-blur-sm border border-white/10`}>
                                            <IntegrationIcon className={`w-3.5 h-3.5 ${integration.color}`} />
                                            <span className={`text-xs font-medium ${integration.color}`}>
                                                {integration.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <div className="space-y-1">
                                        <h4 className="text-base font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                                            {product.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>

                                    {/* Features rápidos */}
                                    {product.features && product.features.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {product.features.slice(0, 2).map((feature, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-[10px] px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded-full border border-slate-700/50"
                                                >
                                                    {feature.label}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Precio y score de integración */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-emerald-400">
                                                ${product.priceMXN.toLocaleString('es-MX')} MXN
                                            </span>
                                            {product.originalPriceMXN && (
                                                <span className="text-[10px] text-slate-500 line-through">
                                                    ${product.originalPriceMXN.toLocaleString('es-MX')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Curie Score */}
                                        {product.curieIntegration?.curieScore && (
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <Zap className="w-3 h-3 text-yellow-400" />
                                                <span>{product.curieIntegration.curieScore}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}