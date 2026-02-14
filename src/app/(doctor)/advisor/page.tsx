// src/app/(doctor)/advisor/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AdvisorChat } from '@/components/doctor/advisor/AdvisorChat';
import { BrainCircuit, Info, ShieldCheck, Zap } from 'lucide-react';

export default async function AdvisorPage() {
    const token = await getAccessToken();
    if (!token) redirect('/login');

    const payload = verifyAccessToken(token);
    const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.userId }
    });

    if (!doctor) redirect('/onboarding/doctor');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-in fade-in duration-700">
            {/* Sidebar Info */}
            <div className="lg:col-span-1 space-y-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-emerald-400" />
                        Arkangel AI
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Tu asistente de medicina de precisión. Utiliza este espacio para realizar consultas clínicas transversales sobre tu población de pacientes.
                    </p>
                </div>

                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Capacidades
                    </h4>
                    <div className="space-y-4">
                        {[
                            { title: 'Detección de Patrones', desc: 'Cruza métricas de wearables con resultados de labs.' },
                            { title: 'Análisis de Riesgo', desc: 'Identifica pacientes con mayor probabilidad de falla metabólica.' },
                            { title: 'Sugerencias de Plan', desc: 'Optimiza macronutrientes basados en composición.' }
                        ].map((cap, i) => (
                            <div key={i} className="space-y-1">
                                <p className="text-sm font-bold text-slate-200">{cap.title}</p>
                                <p className="text-xs text-slate-500">{cap.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Privacidad HIPAA</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/60 dark:text-emerald-400/60 leading-tight italic">
                        Todos los datos enviados a Arkangel AI están anonimizados y cifrados de punta a punta.
                    </p>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="lg:col-span-3">
                <AdvisorChat doctorId={doctor.id} />

                <div className="mt-8 flex items-center justify-center gap-8 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> IA entrenada con +10M casos clínicos</span>
                    <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Sincronización en tiempo real con Prisma</span>
                </div>
            </div>
        </div>
    );
}
