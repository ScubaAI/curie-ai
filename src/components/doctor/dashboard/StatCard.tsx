// src/components/doctor/dashboard/StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color: string;
}

export const StatCard = ({ label, value, icon: Icon, trend, color }: StatCardProps) => {
    return (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md hover:border-emerald-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {trend.isUp ? '+' : '-'}{trend.value}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
            </div>
        </div>
    );
};
