// src/app/(doctor)/patients/[patientId]/composition/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';
import { LineChart as LineChartIcon, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { CompositionChart } from '@/components/doctor/patient-detail/CompositionChart';

export default async function PatientCompositionPage({ params }: { params: { patientId: string } }) {
    const compositions = await prisma.compositionRecord.findMany({
        where: { patientId: params.patientId },
        orderBy: { measuredAt: 'desc' }
    });

    const latest = compositions[0];
    const previous = compositions[1];

    const calculateChange = (curr: number | null, prev: number | null) => {
        if (curr === null || prev === null) return null;
        return curr - prev;
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5 text-emerald-400" />
                    Análisis de Composición Corporal
                </h2>
            </div>

            <CompositionChart data={compositions} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Cambio de Peso', val: calculateChange(latest?.weight || null, previous?.weight || null), unit: 'kg' },
                    { label: 'Diferencia Músculo', val: calculateChange(latest?.muscleMass || null, previous?.muscleMass || null), unit: 'kg' },
                    { label: 'Diferencia Grasa', val: calculateChange(latest?.bodyFatPercentage || null, previous?.bodyFatPercentage || null), unit: '%' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <h4 className="text-2xl font-black text-white">
                                {stat.val === null ? '--' : `${stat.val > 0 ? '+' : ''}${stat.val.toFixed(1)} ${stat.unit}`}
                            </h4>
                            {stat.val !== null && stat.val !== 0 && (
                                stat.val > 0 ? <TrendingUp className="w-5 h-5 text-rose-500" /> : <TrendingDown className="w-5 h-5 text-emerald-500" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl">
                <div className="flex items-center gap-2 text-white font-bold mb-6">
                    <Info className="w-5 h-5 text-cyan-400" />
                    Interpretación de Tendencias
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                    El paciente muestra una tendencia positiva en la recomposición corporal. A pesar de que el peso total ha aumentado ligeramente, se observa que el incremento proviene principalmente de masa muscular esquelética (+0.8kg), mientras que el porcentaje de grasa corporal se mantiene estable. Se recomienda continuar con el protocolo de fuerza actual.
                </p>
            </div>
        </div>
    );
}
