'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SystemEvent, EventFilters } from './types';
import { EventList } from './components/EventList';
import { EventFiltersComponent } from './components/EventFilters';
import { EventDetailModal } from './components/EventDetailModal';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);
    const [filters, setFilters] = useState<EventFilters>({});
    const [stats, setStats] = useState({ unread: 0, total: 0 });

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.severity) params.append('severity', filters.severity);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);

            const response = await fetch(`/api/admin/events?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            setEvents(data);

            // Calc stats for the header
            const unreadCount = data.filter((e: SystemEvent) => !e.isRead).length;
            setStats({ unread: unreadCount, total: data.length });
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectEvent = async (event: SystemEvent) => {
        setSelectedEvent(event);
        if (!event.isRead) {
            // Mark as read in background
            try {
                await fetch('/api/admin/events', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: event.id, isRead: true })
                });
                // Update local state to reflect read status
                setEvents(prev => prev.map(e => e.id === event.id ? { ...e, isRead: true } : e));
                setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
            } catch (error) {
                console.error('Failed to mark event as read:', error);
            }
        }
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-slate-50/50">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Eventos del Sistema
                        {stats.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full animate-bounce shadow-lg shadow-red-500/20">
                                {stats.unread} NUEVOS
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Monitoreo histórico de logs, alertas y rotación de seguridad.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchEvents}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        REFRESCAR
                    </button>
                </div>
            </header>

            <EventFiltersComponent filters={filters} onFilterChange={setFilters} />

            <div className="relative">
                <EventList
                    events={events}
                    onSelectEvent={handleSelectEvent}
                    isLoading={isLoading}
                />
            </div>

            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
}
