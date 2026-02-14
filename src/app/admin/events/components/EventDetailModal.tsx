'use client';

import React from 'react';
import { SystemEvent } from '../types';

interface Props {
    event: SystemEvent | null;
    onClose: () => void;
}

export const EventDetailModal: React.FC<Props> = ({ event, onClose }) => {
    if (!event) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descripción</label>
                        <p className="text-slate-700 leading-relaxed italic border-l-4 border-slate-200 pl-4">
                            {event.description || 'Sin descripción adicional.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo</span>
                            <span className="text-sm font-semibold text-slate-900">{event.type}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Severidad</span>
                            <span className={`text-sm font-bold ${getSeverityColor(event.severity)}`}>
                                {event.severity}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Datos Técnicos (JSON)</label>
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
                            <pre className="text-emerald-400 text-xs font-mono">
                                {JSON.stringify(event.data, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

function getSeverityColor(severity: string) {
    switch (severity) {
        case 'CRITICAL': return 'text-purple-600';
        case 'ERROR': return 'text-red-500';
        case 'HIGH': return 'text-orange-500';
        case 'MEDIUM': return 'text-amber-500';
        case 'LOW': return 'text-emerald-500';
        default: return 'text-blue-500';
    }
}
