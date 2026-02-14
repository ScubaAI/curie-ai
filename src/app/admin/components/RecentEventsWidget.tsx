'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

interface Event {
    id: string;
    type: string;
    severity: string;
    title: string;
    createdAt: Date;
}

interface Props {
    events: Event[];
}

export const RecentEventsWidget: React.FC<Props> = ({ events }) => {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    Salud del Sistema
                </h3>
                <Link
                    href="/admin/events"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
                >
                    Ver Todo →
                </Link>
            </div>

            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="text-center py-6">
                        <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Todo en orden</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="flex gap-3 items-start p-3 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                            {renderIcon(event.severity)}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-200 truncate leading-tight">
                                    {event.title}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                                    {new Date(event.createdAt).toLocaleDateString()} • {event.type}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

function renderIcon(severity: string) {
    switch (severity) {
        case 'CRITICAL':
        case 'ERROR':
            return <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />;
        case 'HIGH':
        case 'MEDIUM':
            return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
        default:
            return <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;
    }
}
