// src/app/admin/shop/layout.tsx
import Link from 'next/link';
import { ShoppingBag, PlusCircle, LayoutGrid, BarChart3, Settings } from 'lucide-react';

export default function ShopAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-8">
            {/* Shop Sub-header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-3xl border border-indigo-500/10 backdrop-blur-md shadow-xl">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-indigo-400" />
                        Curie Health Shop Admin
                    </h1>
                    <p className="text-slate-400 text-sm">Gestiona el catálogo de dispositivos médicos y wearables.</p>
                </div>

                <nav className="flex items-center gap-2 p-1.5 bg-slate-950/50 rounded-2xl border border-indigo-900/20 shadow-inner">
                    <Link
                        href="/admin/shop"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-900/30 text-slate-300 hover:text-white transition-all group"
                    >
                        <LayoutGrid className="w-4 h-4 text-indigo-500 transition-transform group-hover:scale-110" />
                        Catálogo
                    </Link>
                    <Link
                        href="/admin/shop/new"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg hover:shadow-indigo-900/40"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Nuevo Producto
                    </Link>
                </nav>
            </div>

            <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </div>
        </div>
    );
}
