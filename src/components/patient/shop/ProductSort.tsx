// src/components/patient/shop/ProductSort.tsx
import React from 'react';
import { SortOption } from '@/lib/shop/types';

interface ProductSortProps {
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
    resultCount: number;
}

export const ProductSort: React.FC<ProductSortProps> = ({ currentSort, onSortChange, resultCount }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <p className="text-slate-400 text-sm">
                Mostrando <span className="text-white font-bold">{resultCount}</span> productos disponibles
            </p>

            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Ordenar por
                </span>
                <select
                    value={currentSort}
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all cursor-pointer"
                >
                    <option value="recommended">Recomendados</option>
                    <option value="popular">Más populares</option>
                    <option value="price-low">Precio: menor a mayor</option>
                    <option value="price-high">Precio: mayor a menor</option>
                </select>
            </div>
        </div>
    );
};
