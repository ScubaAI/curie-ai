// src/components/patient/shop/ProductFilters.tsx
import React from 'react';
import { Filter, X } from 'lucide-react';
import { ProductCategory } from '@/lib/shop/types';

interface ProductFiltersProps {
    selectedCategory: ProductCategory | 'all';
    onCategoryChange: (category: ProductCategory | 'all') => void;
    brands: string[];
    selectedBrand: string | 'all';
    onBrandChange: (brand: string | 'all') => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
    selectedCategory,
    onCategoryChange,
    brands,
    selectedBrand,
    onBrandChange
}) => {
    const categories: { label: string; value: ProductCategory | 'all' }[] = [
        { label: 'Todos', value: 'all' },
        { label: 'Wearables', value: 'wearable' },
        { label: 'Básculas', value: 'scale' },
        { label: 'Sensores', value: 'sensor' },
        { label: 'Accesorios', value: 'accessory' }
    ];

    return (
        <div className="flex flex-col gap-6 p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Filter size={18} className="text-cyan-400" />
                    Filtros
                </h3>
                {(selectedCategory !== 'all' || selectedBrand !== 'all') && (
                    <button
                        onClick={() => { onCategoryChange('all'); onBrandChange('all'); }}
                        className="text-[10px] text-slate-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1"
                    >
                        <X size={12} /> Limpiar
                    </button>
                )}
            </div>

            {/* Categorías */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría</h4>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => onCategoryChange(cat.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Marcas */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Marca</h4>
                <div className="space-y-2">
                    {['all', ...brands].map((brand) => (
                        <label
                            key={brand}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedBrand === brand
                                        ? 'bg-emerald-500 border-emerald-500 shadow-sm'
                                        : 'bg-slate-950/50 border-slate-700 group-hover:border-slate-500'
                                    }`}
                                onClick={() => onBrandChange(brand as any)}
                            >
                                {selectedBrand === brand && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className={`text-sm ${selectedBrand === brand ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {brand === 'all' ? 'Todas las marcas' : brand}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};
