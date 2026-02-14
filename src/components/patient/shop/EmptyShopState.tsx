// src/components/patient/shop/EmptyShopState.tsx
import React from 'react';
import { ShoppingBag, RefreshCw } from 'lucide-react';

interface EmptyShopStateProps {
    onReset: () => void;
}

export const EmptyShopState: React.FC<EmptyShopStateProps> = ({ onReset }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-500">
                <ShoppingBag size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No encontramos lo que buscas</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
                No hay dispositivos que coincidan con los filtros seleccionados. Intenta ajustarlos para ver más opciones.
            </p>
            <button
                onClick={onReset}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all"
            >
                <RefreshCw size={18} />
                Limpiar filtros
            </button>
        </div>
    );
};
