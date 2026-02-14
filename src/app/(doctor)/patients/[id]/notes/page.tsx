// src/app/(doctor)/patients/[id]/notes/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { NoteEditor } from '@/components/doctor/patient-detail/NoteEditor';
import { Clock, Calendar, Hash } from 'lucide-react';

export default async function PatientNotesPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: patientId } = await params;
    const token = await getAccessToken();
    if (!token) redirect('/login');

    const payload = verifyAccessToken(token);

    const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.userId }
    });

    if (!doctor) redirect('/onboarding/doctor');

    const notes = await prisma.doctorNote.findMany({
        where: {
            patientId: patientId,
            doctorId: doctor.id
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Editor - Sticky on LG */}
            <div className="lg:col-span-1">
                <div className="sticky top-10">
                    <NoteEditor patientId={patientId} />

                    <div className="mt-8 p-6 bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Guía de Notas</h4>
                        <ul className="space-y-3 text-xs text-slate-400">
                            <li className="flex gap-2">
                                <span className="text-emerald-500">•</span>
                                Documenta cambios en medicación.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">•</span>
                                Anota observaciones de Arkangel AI.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">•</span>
                                Establece objetivos para el próximo mes.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Notes List */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-xl font-black text-white px-2">Historial de Notas Clínicas</h3>

                {notes.length === 0 ? (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-16 text-center">
                        <p className="text-slate-500">No hay notas registradas para este paciente todavía.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notes.map((note) => (
                            <div key={note.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl hover:border-slate-700 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-lg font-black text-white mb-1">{note.title || 'Nota Médica'}</h4>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold uppercase tracking-tighter">
                                                {note.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {note.content}
                                </div>

                                {note.diagnosis && note.diagnosis.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-wrap gap-2">
                                        {note.diagnosis.map((d, idx) => (
                                            <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20">
                                                <Hash className="w-3 h-3" />
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
