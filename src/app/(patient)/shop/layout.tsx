// src/app/(patient)/shop/layout.tsx
import { ShoppingCart } from 'lucide-react';
import FloatingSparkle from '@/components/patient/shop/FloatingSparkle';

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-black/95 pb-20">
            {/* Contenedor principal con breathing room */}
            <div className="max-w-7xl mx-auto px-6 pt-12 lg:pt-16 space-y-12">
                {/* Header – más magnético, con glow y exclusividad */}
                <div className="relative">
                    {/* Subtle overlay glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/10 to-transparent pointer-events-none rounded-3xl" />

                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-3xl p-8 lg:p-10 backdrop-blur-xl shadow-2xl shadow-cyan-950/30">
                        <nav className="flex items-center gap-3 text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-6 opacity-80">
                            <span className="hover:text-cyan-300 transition-colors">Paciente</span>
                            <span className="opacity-40">/</span>
                            <span className="text-emerald-400">Curie Health Shop</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-cyan-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent flex items-center gap-5">
                                    Health Shop
                                    <FloatingSparkle />
                                </h1>
                                <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
                                    Dispositivos médicos de élite, curados para ti.
                                    Cada uno sincroniza automáticamente con tu dashboard Curie — elevando tu soberanía biológica a un nivel superior.
                                </p>
                            </div>

                            {/* Icono cart con pulse sutil */}
                            <div className="flex items-center gap-4 self-start md:self-end">
                                <div className="relative">
                                    <ShoppingCart className="w-10 h-10 text-cyan-500 opacity-70" />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                                </div>
                                <span className="text-sm text-slate-400">Tu carrito • 0 items</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido hijo – el grid de productos */}
                <div className="relative">
                    {children}
                </div>
            </div>
        </div>
    );
}