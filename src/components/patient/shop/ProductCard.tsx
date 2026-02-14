// src/components/patient/shop/ProductCard.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap, ChevronRight, Wifi, RefreshCw, Bluetooth } from 'lucide-react';
import { Product, CurieIntegrationLevel } from '@/lib/shop/types';

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

const integrationIcons: Record<CurieIntegrationLevel, typeof Wifi> = {
    native: Zap,
    api: RefreshCw,
    manual: Bluetooth,
    planned: Wifi
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
    const IntegrationIcon = integrationIcons[product.curieIntegration?.level || 'manual'];
    const isNew = product.isNew || (product.releaseDate && new Date(product.releaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`relative flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm group transition-all duration-300 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-950/20`}
        >
            {/* Badges superiores */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.isRecommended && (
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 rounded-full border border-emerald-400/30 shadow-lg">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
                            <Zap size={10} /> Recomendado
                        </span>
                    </div>
                )}
                {isNew && (
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 rounded-full border border-violet-400/30 shadow-lg">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
                            ✨ Nuevo
                        </span>
                    </div>
                )}
            </div>

            {/* Curie Score badge (top right) */}
            {product.curieIntegration?.curieScore && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-slate-950/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] font-bold text-slate-300">{product.curieIntegration.curieScore}%</span>
                    </div>
                </div>
            )}

            {/* Imagen */}
            <div className="aspect-square relative overflow-hidden bg-slate-950/20">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-product.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Integration overlay (bottom) */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <IntegrationIcon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Sync Curie</span>
                            <span className="text-[9px] text-slate-400 capitalize">{product.curieIntegration?.level === 'native' ? 'Tiempo Real' : product.curieIntegration?.level === 'api' ? 'Sincronización API' : 'Manual'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {product.brand}
                    </span>
                    <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-[10px] text-slate-400">{product.rating || 4.9} ({product.reviewCount || 100})</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                    {product.name}
                </h3>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                    {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-emerald-400">
                            ${product.priceMXN.toLocaleString()} {product.currency}
                        </span>
                        {product.originalPriceMXN && (
                            <span className="text-xs text-slate-500 line-through">
                                ${product.originalPriceMXN.toLocaleString()} {product.currency}
                            </span>
                        )}
                    </div>

                    <Link
                        href={`/shop/${product.slug}`}
                        className="p-3 bg-slate-800 hover:bg-cyan-600 rounded-2xl text-white transition-all duration-300 shadow-lg hover:shadow-cyan-900/40"
                    >
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
