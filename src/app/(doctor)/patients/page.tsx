// src/app/(doctor)/patients/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Search, Filter, Plus, Users as UsersIcon } from 'lucide-react';
import { PatientCard } from '@/components/doctor/patients/PatientCard';

export default async function PatientsListPage({
    searchParams,
}: {
    searchParams: { q?: string; risk?: string };
}) {
    const token = await getAccessToken();
    if (!token) redirect('/login');

    const payload = verifyAccessToken(token);
    const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.userId }
    });

    if (!doctor) redirect('/onboarding/doctor');

    const query = searchParams.q;

    const patientsRelationships = await prisma.doctorPatientRelationship.findMany({
        where: {
            doctorId: doctor.id,
            patient: query ? {
                OR: [
                    { user: { firstName: { contains: query, mode: 'insensitive' } } },
                    { user: { lastName: { contains: query, mode: 'insensitive' } } },
                    { mrn: { contains: query, mode: 'insensitive' } }
                ]
            } : undefined
        },
        include: {
            patient: {
                include: {
                    user: true,
                    compositions: { orderBy: { measuredAt: 'desc' }, take: 1 },
                    vitalLogs: { orderBy: { measuredAt: 'desc' }, take: 1 }
                }
            }
        },
        orderBy: { patient: { user: { lastName: 'asc' } } }
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <UsersIcon className="w-8 h-8 text-emerald-500" />
                        Directorio de Pacientes
                    </h1>
                    <p className="text-slate-500 mt-1">Gestiona {patientsRelationships.length} pacientes activos en tu práctica.</p>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-bold shadow-lg shadow-emerald-900/20">
                    <Plus className="w-5 h-5" />
                    Registrar Paciente
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o MRN..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl hover:text-white transition-all font-medium">
                    <Filter className="w-5 h-5" />
                    Filtros Avanzados
                </button>
            </div>

            {patientsRelationships.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-16 text-center">
                    <UsersIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-400 text-lg font-medium">No se encontraron pacientes</h3>
                    <p className="text-slate-600 text-sm mt-1">Intenta con otro término de búsqueda o registra uno nuevo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {patientsRelationships.map((rel) => (
                        <PatientCard key={rel.patient.id} patient={rel.patient} />
                    ))}
                </div>
            )}
        </div>
    );
}
