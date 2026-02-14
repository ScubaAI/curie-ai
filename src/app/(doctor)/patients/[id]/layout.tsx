// src/app/(doctor)/patients/[id]/layout.tsx
import React from 'react';
import Link from 'next/link';
import {
    LineChart,
    Beaker,
    FileText,
    MessageSquare,
    LayoutDashboard,
    ArrowLeft,
    Settings
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function PatientDetailLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Alias to patientId for clarity in logic below if needed, or just use id
    const patientId = id;

    const token = await getAccessToken();
    if (!token) redirect('/login');

    const payload = verifyAccessToken(token);

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: true }
    });

    if (!patient) redirect('/doctor/dashboard'); // Fixed redirect from /admin/dashboard

    const tabs = [
        { id: 'summary', label: 'Resumen', icon: LayoutDashboard, href: `/doctor/patients/${patientId}` },
        { id: 'composition', label: 'Composición', icon: LineChart, href: `/doctor/patients/${patientId}/composition` },
        { id: 'labs', label: 'Laboratorios', icon: Beaker, href: `/doctor/patients/${patientId}/labs` },
        { id: 'notes', label: 'Notas Médicas', icon: FileText, href: `/doctor/patients/${patientId}/notes` },
        { id: 'chat', label: 'Chat Curie', icon: MessageSquare, href: `/doctor/patients/${patientId}/chat` },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Patient Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-5">
                    <Link
                        href="/doctor/dashboard"
                        className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-black shadow-xl">
                            {patient.user.firstName?.[0]}{patient.user.lastName?.[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-white">{patient.user.firstName} {patient.user.lastName}</h1>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/20">Activo</span>
                            </div>
                            <p className="text-slate-500 text-sm">MRN: {patient.mrn || '---'} • {patient.gender || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white transition-all text-sm font-bold">
                        <Settings className="w-4 h-4" />
                        Configurar Plan
                    </button>
                    <Link href="/doctor/advisor" className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all text-sm font-bold shadow-lg shadow-emerald-900/20">
                        Arkangel Advisor
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 p-1 bg-slate-950/50 border border-slate-900 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all transition-all"
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </Link>
                ))}
            </nav>

            <div className="min-h-[500px]">
                {children}
            </div>
        </div>
    );
}
