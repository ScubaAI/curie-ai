// src/components/shared/EmptyState.tsx
import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState = ({ title, description, icon: Icon = SearchX, action }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl">
            <div className="p-4 bg-slate-900 rounded-2xl mb-6">
                <Icon className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-8 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
