'use client';

import React from 'react';
import { SystemEvent } from '../types';
import Badge from '@/components/Badge';

interface Props {
    events: SystemEvent[];
    onSelectEvent: (event: SystemEvent) => void;
    isLoading: boolean;
}

export const EventList: React.FC<Props> = ({ events, onSelectEvent, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-medium">Cargando eventos...</p>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex items-center justify-center text-center p-8">
                <div>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No hay eventos</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">No se encontraron eventos que coincidan con los filtros seleccionados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[180px]">Fecha</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[120px]">Severidad</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[200px]">Tipo</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Título</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[100px] text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {events.map((event) => (
                            <tr
                                key={event.id}
                                className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${!event.isRead ? 'bg-blue-50/20' : ''}`}
                                onClick={() => onSelectEvent(event)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs font-medium text-slate-500 block">
                                        {new Date(event.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-mono">
                                        {new Date(event.createdAt).toLocaleTimeString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {renderSeverityBadge(event.severity)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-bold text-slate-700 font-mono tracking-tight bg-slate-100 px-2 py-0.5 rounded">
                                        {event.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {!event.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 flex-shrink-0 animate-pulse"></div>}
                                        <p className={`text-sm tracking-tight ${!event.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                            {event.title}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate max-w-[300px] mt-0.5">
                                        {event.description}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button
                                        className="text-xs font-black uppercase text-blue-500 hover:text-blue-700 tracking-tighter transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                    >
                                        Detalles →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                <p>Mostrando {events.length} eventos</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:border-slate-300 disabled:opacity-50" disabled>Anterior</button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:border-slate-300 disabled:opacity-50" disabled>Siguiente</button>
                </div>
            </div>
        </div>
    );
};

function renderSeverityBadge(severity: string) {
    // Mapping internal types to Badge component types if possible, otherwise custom styles
    switch (severity) {
        case 'CRITICAL':
            return <Badge text="CRITICAL" color="purple" />;
        case 'ERROR':
            return <span className="px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider text-red-400 border-red-500/20 bg-red-500/5">ERROR</span>;
        case 'HIGH':
            return <span className="px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider text-orange-400 border-orange-500/20 bg-orange-500/5">HIGH</span>;
        case 'MEDIUM':
            return <span className="px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider text-amber-400 border-amber-500/20 bg-amber-500/5">MEDIUM</span>;
        case 'LOW':
            return <Badge text="LOW" color="emerald" />;
        default:
            return <Badge text="INFO" color="cyan" />;
    }
}
