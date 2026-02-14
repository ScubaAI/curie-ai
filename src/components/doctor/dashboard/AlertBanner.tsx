'use client';

// src/components/doctor/dashboard/AlertBanner.tsx
import React from 'react';
import { AlertTriangle, Info, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Alert {
    id: string;
    patientName: string;
    type: string;
    message?: string;
    severity: 'HIGH' | 'MEDIUM' | 'INFO';
    timestamp: Date;
}

export const AlertBanner = ({ alerts }: { alerts: Alert[] }) => {
    if (alerts.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    Alertas Críticas ({alerts.length})
                </h3>
                <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Ver todas</button>
            </div>

            <div className="grid gap-3">
                {alerts.map((alert, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={alert.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md shadow-lg ${alert.severity === 'HIGH'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${alert.severity === 'HIGH' ? 'bg-rose-500/20' : 'bg-amber-500/20'
                                }`}>
                                {alert.severity === 'HIGH' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{alert.patientName}</p>
                                <p className="text-xs opacity-80">{alert.message || `Anomalía en ${alert.type}`}</p>
                            </div>
                        </div>

                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
