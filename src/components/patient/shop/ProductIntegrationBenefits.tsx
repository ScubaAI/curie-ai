// src/components/patient/shop/ProductIntegrationBenefits.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, ShieldCheck, HeartPulse, RefreshCw, Bluetooth, Wifi } from 'lucide-react';
import { Product, CurieIntegrationLevel } from '@/lib/shop/types';

interface ProductIntegrationBenefitsProps {
    product: Product;
}

const integrationLabels: Record<CurieIntegrationLevel, string> = {
    native: 'Sincronización Nativa',
    api: 'Sincronización vía API',
    manual: 'Registro Manual Asistido',
    planned: 'Sincronización en Roadmap'
};

const integrationIcons: Record<CurieIntegrationLevel, React.ReactNode> = {
    native: <Zap className="w-8 h-8 text-emerald-400" />,
    api: <RefreshCw className="w-8 h-8 text-cyan-400" />,
    manual: <Bluetooth className="w-8 h-8 text-amber-400" />,
    planned: <Wifi className="w-8 h-8 text-slate-400" />
};

export default function ProductIntegrationBenefits({ product }: ProductIntegrationBenefitsProps) {
    const integration = product.curieIntegration;

    const benefits = [
        {
            icon: integrationIcons[integration.level],
            title: integrationLabels[integration.level],
            description: integration.level === 'native'
                ? 'Tus datos fluyen en tiempo real a tu perfil médico sin necesidad de aplicaciones intermediarias.'
                : integration.level === 'api'
                    ? 'Sincronización automática periódica con los servidores de la marca para mantener tu perfil actualizado.'
                    : 'Ingreso simplificado de datos que Curie procesará para tu seguimiento médico.'
        },
        {
            icon: <Database className="w-8 h-8 text-blue-400" />,
            title: `Smart Sync: ${integration.syncFields.length} métricas`,
            description: `Sincroniza: ${integration.syncFields.slice(0, 4).join(', ')}${integration.syncFields.length > 4 ? '...' : ''}`
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
            title: 'Seguridad Biométrica',
            description: 'Toda la telemetría se encripta de punto a punto antes de ser analizada por tu equipo clínico.'
        }
    ];

    return (
        <section className="space-y-12">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-4">
                    <Zap className="w-4 h-4 fill-cyan-400" />
                    CURIE SCORE: {integration.curieScore}% CONSISTENCIA
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Curie Biological Integration</h2>
                <p className="text-slate-400 max-w-2xl mx-auto italic">
                    "No es solo un dispositivo, es una extensión de tu sistema de salud."
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {benefits.map((benefit, i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-cyan-500/30 transition-all group shadow-xl">
                        <div className="p-4 bg-slate-950/60 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-inner">
                            {benefit.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{benefit.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {benefit.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

