// src/app/admin/shop/[productId]/page.tsx
import { ProductForm } from '@/components/admin/shop/ProductForm';
import { ChevronLeft, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
    params
}: {
    params: { productId: string }
}) {
    const product = await prisma.product.findUnique({
        where: { id: params.productId }
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/shop"
                        className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-lg"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-white">Editar: {product.name}</h2>
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-500 rounded text-[10px] font-mono">
                                {product.id}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm">Actualiza los metadatos técnicos o comerciales del dispositivo.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/shop/${product.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl hover:text-white hover:border-indigo-500/30 transition-all text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Ver en Tienda
                    </Link>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl hover:text-white hover:border-amber-500/30 transition-all text-sm font-medium">
                        <Activity className="w-4 h-4 text-amber-500" />
                        Logs de Sync
                    </button>
                </div>
            </div>

            <ProductForm initialData={product} isEditing={true} />

            {/* Quick Audit Info */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-wrap gap-x-12 gap-y-4 text-xs text-slate-500 italic">
                <span>Creado: {product.createdAt.toLocaleString()}</span>
                <span>Última actualización: {product.updatedAt.toLocaleString()}</span>
                <span>UUID: {product.id}</span>
            </div>
        </div>
    );
}
