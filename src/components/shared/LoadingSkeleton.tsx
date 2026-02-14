// src/components/shared/LoadingSkeleton.tsx
import React from 'react';

export const LoadingSkeleton = ({ count = 3 }: { count?: number }) => {
    return (
        <div className="space-y-4 w-full animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-800 rounded-lg w-1/3" />
                            <div className="h-3 bg-slate-800 rounded-lg w-1/4" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-slate-800/50 rounded-2xl" />
                        <div className="h-16 bg-slate-800/50 rounded-2xl" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton = () => (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 h-64 animate-pulse flex flex-col gap-4">
        <div className="h-6 bg-slate-800 rounded-lg w-1/2" />
        <div className="flex-1 bg-slate-800/30 rounded-2xl" />
    </div>
);
