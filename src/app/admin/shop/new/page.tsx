// src/app/admin/shop/new/page.tsx
import { ProductForm } from '@/components/admin/shop/ProductForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/shop"
                    className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-white">Nuevo Dispositivo Médico</h2>
                    <p className="text-slate-500 text-sm">Completa los campos para añadir un nuevo producto al ecosistema Curie.</p>
                </div>
            </div>

            <ProductForm />
        </div>
    );
}
