'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    ArrowLeft,
    Zap,
    ShieldCheck,
    Image as ImageIcon,
    Globe,
    Package,
    Plus,
    Trash2,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { ProductCategory, ProductStockStatus, CurieIntegrationLevel } from '@prisma/client';

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Simplificamos por brevedad, en una implementación real usaríamos react-hook-form
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        brand: initialData?.brand || '',
        priceMXN: initialData?.priceMXN || 0,
        originalPriceMXN: initialData?.originalPriceMXN || '',
        category: initialData?.category || 'WEARABLE' as ProductCategory,
        stockStatus: initialData?.stockStatus || 'IN_STOCK' as ProductStockStatus,
        description: initialData?.description || '',
        longDescription: initialData?.longDescription || '',
        image: initialData?.image || '',
        integrationLevel: initialData?.curieIntegrationLevel || 'MANUAL' as CurieIntegrationLevel,
        curieScore: initialData?.curieScore || 0,
        tags: initialData?.tags || [],
        connectivity: initialData?.connectivity || [],
        availableInMX: initialData?.availableInMX ?? true,
    });

    const [newTag, setNewTag] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mock submission
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Submitting:', formData);
            router.push('/admin/shop');
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData({ ...formData, tags: [...formData.tags, newTag] });
            setNewTag('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl backdrop-blur-md">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                            <Package className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-xl font-bold text-white">Información General</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Nombre del Producto</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
                                    placeholder="Withings Body Scan"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Slug (URL)</label>
                                <input
                                    required
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
                                    placeholder="withings-body-scan"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Marca</label>
                                <select
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all appearance-none"
                                >
                                    <option value="">Seleccionar Marca</option>
                                    <option value="Withings">Withings</option>
                                    <option value="Oura">Oura</option>
                                    <option value="Garmin">Garmin</option>
                                    <option value="Apple">Apple</option>
                                    <option value="Other">Otro</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Categoría</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all appearance-none"
                                >
                                    {Object.values(ProductCategory).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Descripción Corta (Teaser)</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all resize-none"
                                placeholder="La báscula clínica más avanzada..."
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl backdrop-blur-md">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                            <ShieldCheck className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-xl font-bold text-white">Integración Curie System</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Nivel de Integración</label>
                                <select
                                    value={formData.integrationLevel}
                                    onChange={e => setFormData({ ...formData, integrationLevel: e.target.value as CurieIntegrationLevel })}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/50 outline-none text-white transition-all appearance-none"
                                >
                                    {Object.values(CurieIntegrationLevel).map(lvl => (
                                        <option key={lvl} value={lvl}>{lvl}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Curie Score (0-100)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={formData.curieScore}
                                        onChange={e => setFormData({ ...formData, curieScore: parseInt(e.target.value) })}
                                        className="flex-1 accent-cyan-500"
                                    />
                                    <span className="w-12 text-center font-black text-cyan-400 bg-cyan-950/40 py-1 rounded-lg border border-cyan-500/20">{formData.curieScore}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl backdrop-blur-md sticky top-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                            <Zap className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-xl font-bold text-white">Precios y Stock</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Precio MXN</label>
                                <input
                                    required
                                    value={formData.priceMXN}
                                    onChange={e => setFormData({ ...formData, priceMXN: parseInt(e.target.value) })}
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-white transition-all"
                                    placeholder="5499"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Precio Original (Opcional)</label>
                                <input
                                    value={formData.originalPriceMXN}
                                    onChange={e => setFormData({ ...formData, originalPriceMXN: e.target.value })}
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-white transition-all"
                                    placeholder="6299"
                                />
                            </div>
                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">Estado del Inventario</label>
                                <select
                                    value={formData.stockStatus}
                                    onChange={e => setFormData({ ...formData, stockStatus: e.target.value as ProductStockStatus })}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-white transition-all appearance-none"
                                >
                                    {Object.values(ProductStockStatus).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-900/30 hover:shadow-indigo-900/50"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                            <Link
                                href="/admin/shop"
                                className="w-full py-4 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

import { RefreshCw } from 'lucide-react';
