'use client';

import React from 'react';
import { EventFilters, EventSeverity, EventType } from '../types';

interface Props {
    filters: EventFilters;
    onFilterChange: (filters: EventFilters) => void;
}

const SEVERITIES: EventSeverity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'ERROR', 'CRITICAL'];
const TYPES: EventType[] = [
    'SYSTEM_STATUS',
    'TOKEN_ROTATION_SUCCESS',
    'TOKEN_ROTATION_FAILURE',
    'SYNC_COMPLETED',
    'SYNC_FAILED',
    'ONBOARDING_COMPLETED',
    'SECURITY_ALERT',
    'API_ERROR',
    'DATABASE_MAINTENANCE'
];

export const EventFiltersComponent: React.FC<Props> = ({ filters, onFilterChange }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Tipo de Evento
                </label>
                <select
                    value={filters.type || ''}
                    onChange={(e) => onFilterChange({ ...filters, type: e.target.value as EventType || undefined })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                    <option value="">Todos los tipos</option>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
            </div>

            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Severidad
                </label>
                <select
                    value={filters.severity || ''}
                    onChange={(e) => onFilterChange({ ...filters, severity: e.target.value as EventSeverity || undefined })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                    <option value="">Todas las severidades</option>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Desde
                </label>
                <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>

            <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Hasta
                </label>
                <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>

            <button
                onClick={() => onFilterChange({})}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
                Limpiar
            </button>
        </div>
    );
};
