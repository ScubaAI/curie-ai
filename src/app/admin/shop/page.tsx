// src/app/admin/shop/page.tsx
import { ShoppingBag, Star, Zap, MoreVertical, Edit2, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductStockStatus, CurieIntegrationLevel } from '@prisma/client';

export default async function AdminShopPage() {
    // En una implementación real con DB poblada:
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const stats = {
        total: products.length,
        inStock: products.filter(p => p.stockStatus === 'IN_STOCK').length,
        nativeSync: products.filter(p => p.curieIntegrationLevel === 'NATIVE').length,
        avgRating: products.reduce((acc, p) => acc + (p.rating || 0), 0) / (products.length || 1)
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Productos', value: stats.total, icon: ShoppingBag, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                    { label: 'En Stock', value: stats.inStock, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Sync Nativo', value: stats.nativeSync, icon: RefreshCw, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                    { label: 'Rating Promedio', value: stats.avgRating.toFixed(1), icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl shadow-black/20 flex items-center gap-4 group hover:border-indigo-500/30 transition-all duration-500">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU o marca..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/50 transition-all text-sm font-medium">
                    <Filter className="w-4 h-4" />
                    Filtros Avanzados
                </button>
            </div>

            {/* Products Table/Grid */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/30">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Producto</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría / Marca</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Precio (MXN)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Integración</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center space-y-4">
                                    <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto opacity-20" />
                                    <p className="text-slate-500 font-medium text-lg">No hay productos en el catálogo aún.</p>
                                    <Link href="/admin/shop/new" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">Crea tu primer producto</Link>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-indigo-900/10 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-900 p-2 border border-slate-800 overflow-hidden shadow-inner">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-product.png'; }}
                                                />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-white truncate max-w-[200px]">{product.name}</span>
                                                <span className="text-xs text-slate-500">ID: {product.slug}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-300 capitalize">{product.category.toLowerCase()}</span>
                                            <span className="text-xs text-slate-500">{product.brand}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-emerald-400">${product.priceMXN.toLocaleString('es-MX')}</span>
                                            {product.originalPriceMXN && (
                                                <span className="text-[10px] text-slate-500 line-through">${product.originalPriceMXN.toLocaleString('es-MX')}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight
                                            ${product.curieIntegrationLevel === 'NATIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                                product.curieIntegrationLevel === 'API' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20' :
                                                    'bg-slate-800 text-slate-400 border border-slate-700'} `}>
                                            <Zap className="w-3 h-3" />
                                            {product.curieIntegrationLevel}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${stockColorMap[product.stockStatus]}`}>
                                            {product.stockStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/shop/${product.id}`}
                                                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 hover:border-indigo-400/50 transition-all hover:scale-110 shadow-lg"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-500/50 transition-all hover:scale-110 shadow-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const stockColorMap: Record<ProductStockStatus, string> = {
    IN_STOCK: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    OUT_OF_STOCK: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PRE_ORDER: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

import { RefreshCw } from 'lucide-react';
