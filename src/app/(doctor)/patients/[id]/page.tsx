import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
    Heart,
    Droplet,
    Wind,
    Zap,
    Scale,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

// Assuming CompositionChart is default export or named export
import { CompositionChart } from '@/components/doctor/patient-detail/CompositionChart';

export default async function PatientSummaryPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    // Await params for Next.js 15+ compatibility
    const { id: patientId } = await params;

    const token = await getAccessToken();
    if (!token) redirect('/login');

    const payload = verifyAccessToken(token);

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            compositions: { orderBy: { measuredAt: 'desc' }, take: 10 },
            labResults: { orderBy: { reportedAt: 'desc' }, take: 5 },
            vitalLogs: { orderBy: { measuredAt: 'desc' }, take: 20 },
        }
    });

    if (!patient) redirect('/doctor/dashboard');

    const latestComp = patient.compositions[0];
    const previousComp = patient.compositions[1];

    const metrics = [
        { label: 'Peso', value: latestComp?.weight ? `${latestComp.weight} kg` : '--', icon: Scale, trend: previousComp ? latestComp.weight - previousComp.weight : 0, color: 'text-emerald-400' },
        { label: 'Grasa Visceral', value: latestComp?.visceralFatRating || '--', icon: Zap, color: 'text-amber-400', status: (latestComp?.visceralFatRating || 0) > 10 ? 'critical' : 'normal' },
        { label: 'Glucosa Ayunas', value: '98 mg/dL', icon: Droplet, color: 'text-cyan-400' },
        { label: 'SPO2', value: '98%', icon: Wind, color: 'text-indigo-400' },
    ];

    return (
        <div className="space-y-8">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-xl bg-opacity-10 bg-slate-100`}>
                                <m.icon className={`w-5 h-5 ${m.color}`} />
                            </div>
                            {m.status === 'critical' && <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />}
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{m.label}</p>
                        <h3 className="text-2xl font-black text-white mt-1">{m.value}</h3>
                        {m.trend !== undefined && m.trend !== 0 && (
                            <p className={`text-[10px] mt-2 font-bold ${typeof m.trend === 'number' && m.trend > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {m.trend > 0 ? '+' : ''}{typeof m.trend === 'number' ? m.trend.toFixed(1) : m.trend} kg desde última medición
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2">
                    <CompositionChart data={patient.compositions} />
                </div>

                {/* Risk Profile & Summary */}
                <div className="space-y-8">
                    <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-white/5 rounded-3xl backdrop-blur-3xl">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            Perfil de Riesgo
                        </h3>
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[15%]" />
                            </div>
                            <p className="text-sm text-slate-300">
                                Riesgo Metabólico **BAJO**. El paciente muestra buena adherencia al plan nutricional y mejora constante en masa muscular.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-400 border border-white/5">Sin Alergias</span>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-400 border border-white/5">No Fumador</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-6">Últimos Laboratorios</h3>
                        <div className="space-y-4">
                            {patient.labResults.slice(0, 3).map((lab, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0">
                                    <div>
                                        <p className="text-sm font-bold text-white">{lab.testName}</p>
                                        <p className="text-[10px] text-slate-500">{new Date(lab.reportedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${lab.status === 'NORMAL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {lab.value} {lab.unit}
                                        </p>
                                        <p className="text-[9px] text-slate-600">Rango: {lab.referenceRange || '--'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href={`/doctor/patient/${patientId}/overview`} className="block text-center mt-6 text-xs text-slate-500 hover:text-white uppercase font-black tracking-widest transition-colors">
                            Ver Dashboard Completo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
