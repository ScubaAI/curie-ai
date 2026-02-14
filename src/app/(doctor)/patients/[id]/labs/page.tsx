// src/app/(doctor)/patients/[patientId]/labs/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';
import { Beaker, TrendingUp, AlertCircle, FileDown } from 'lucide-react';

export default async function PatientLabsPage({ params }: { params: { patientId: string } }) {
    const labs = await prisma.labResult.findMany({
        where: { patientId: params.patientId },
        orderBy: { reportedAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-indigo-400" />
                    Resultados de Laboratorio
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white transition-all text-xs font-bold">
                    <FileDown className="w-4 h-4" />
                    Exportar Historial
                </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950/50 border-b border-slate-800">
                            <th className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest">Estudio / Biomarcador</th>
                            <th className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest">Resultado</th>
                            <th className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest">Estado</th>
                            <th className="px-8 py-5 text-slate-500 text-[10px] font-black uppercase tracking-widest">Fecha Reporte</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {labs.map((lab) => (
                            <tr key={lab.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{lab.testName}</p>
                                    <p className="text-xs text-slate-500">{lab.category || 'General'}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-black text-white">{lab.value}</span>
                                        <span className="text-xs text-slate-500 font-medium">{lab.unit}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1">Rango ref: {lab.referenceRange}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${lab.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        }`}>
                                        {lab.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-slate-400 text-sm">
                                    {new Date(lab.reportedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {labs.length === 0 && (
                    <div className="p-20 text-center text-slate-500 text-sm">
                        No se han cargado resultados de laboratorio para este paciente.
                    </div>
                )}
            </div>
        </div>
    );
}
