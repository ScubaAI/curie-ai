// src/components/doctor/patients/PatientCard.tsx
import React from 'react';
import { User, Activity, Calendar, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

interface PatientCardProps {
    patient: any;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
    const latestComp = patient.compositions?.[0];
    const latestVital = patient.vitalLogs?.[0];

    return (
        <Link href={`/admin/patients/${patient.id}`}>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all group">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {patient.user.firstName?.[0]}{patient.user.lastName?.[0]}
                        </div>
                        <div>
                            <h4 className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                {patient.user.firstName} {patient.user.lastName}
                            </h4>
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                                <Shield className="w-3 h-3 text-emerald-500" /> MRN: {patient.mrn || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Último Peso</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white">{latestComp?.weight || '--'}</span>
                            <span className="text-xs text-slate-500">kg</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Grasa Corporal</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-emerald-400">{latestComp?.bodyFatPercentage || '--'}</span>
                            <span className="text-xs text-slate-500">%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-500" />
                        <span>Última sync: {patient.lastSyncAt ? new Date(patient.lastSyncAt).toLocaleDateString() : 'NUNCA'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Age: {patient.age || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
