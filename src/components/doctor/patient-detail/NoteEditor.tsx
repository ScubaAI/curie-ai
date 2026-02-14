// src/components/doctor/patient-detail/NoteEditor.tsx
'use client';

import React, { useState } from 'react';
import { FileText, Save, Plus, Loader2 } from 'lucide-react';

interface NoteEditorProps {
    patientId: string;
    onNoteAdded?: () => void;
}

export const NoteEditor = ({ patientId, onNoteAdded }: NoteEditorProps) => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/doctor/patients/${patientId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    title: title || 'Nota de Seguimiento',
                    category: 'CONSULTATION'
                })
            });

            if (res.ok) {
                setContent('');
                setTitle('');
                if (onNoteAdded) onNoteAdded();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Nueva Nota Clínica</h3>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título de la nota (ej. Control Mensual Febrero)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-slate-700"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe el resumen clínico, observaciones o plan de acción..."
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700 resize-none"
                />

                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-6 py-3 rounded-xl border border-slate-800 text-slate-500 hover:text-white transition-all text-sm font-bold">
                        Descartar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-emerald-900/20"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Nota
                    </button>
                </div>
            </div>
        </div>
    );
};
