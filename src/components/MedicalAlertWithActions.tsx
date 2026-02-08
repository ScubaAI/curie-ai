/**
 * MedicalAlertWithActions – Nexus "Ready to Receive" Edition 2026
 * * Cambios clave:
 * 1. brandSource: Identifica la procedencia del dato (Garmin, Withings, etc.)
 * 2. lastSync: Refuerza la confianza en el Live Link.
 * 3. Dynamic Glow: El pulso visual se sincroniza con el origen del dato.
 */

'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle, Info, XCircle,
  HeartPulse, ShieldCheck, Zap, Activity, Scale, Sparkles, Cpu
} from 'lucide-react';

// Tipos de alerta para el Mood de Helena
export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'emergency';

// Marcas del ecosistema Visionary-Ready
export type BrandSource = 'garmin' | 'withings' | 'crisalix' | 'inbody' | 'helena';

export interface AlertAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}

interface MedicalAlertWithActionsProps {
  type: AlertType;
  title: string;
  description: string;
  brandSource?: BrandSource; // Nuevo: Identificador de marca
  lastSync?: string;         // Nuevo: Timestamp humano
  icon?: ReactNode;
  actions?: AlertAction[];
  confidence?: number;
  className?: string;
  pulse?: boolean;
}

// Mapeo de identidad de marca (Ecosistema Ready)
const brandIdentity = {
  garmin: { icon: <Activity className="w-4 h-4" />, label: 'Garmin Connect', color: 'text-[#007CC3]' },
  withings: { icon: <Zap className="w-4 h-4" />, label: 'Withings Health', color: 'text-slate-900' },
  crisalix: { icon: <Sparkles className="w-4 h-4" />, label: 'Crisalix 3D', color: 'text-rose-500' },
  inbody: { icon: <Scale className="w-4 h-4" />, label: 'InBody Composition', color: 'text-emerald-600' },
  helena: { icon: <Cpu className="w-4 h-4" />, label: 'Helena AI Core', color: 'text-cyan-500' }
};

const alertStyles = {
  success: {
    bg: 'bg-gradient-to-br from-emerald-50/95 to-teal-50/80',
    border: 'border-emerald-200/70',
    iconBg: 'bg-emerald-100/80',
    icon: 'text-emerald-700',
    title: 'text-emerald-950',
    desc: 'text-emerald-800/90',
    glow: 'from-emerald-400/25 to-teal-400/15',
    defaultIcon: <CheckCircle className="w-8 h-8" />
  },
  error: {
    bg: 'bg-gradient-to-br from-rose-50/95 to-red-50/80',
    border: 'border-rose-200/70',
    iconBg: 'bg-rose-100/80',
    icon: 'text-rose-700',
    title: 'text-rose-950',
    desc: 'text-rose-800/90',
    glow: 'from-rose-400/30 to-red-400/20',
    defaultIcon: <XCircle className="w-8 h-8" />
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50/95 to-yellow-50/80',
    border: 'border-amber-200/70',
    iconBg: 'bg-amber-100/80',
    icon: 'text-amber-700',
    title: 'text-amber-950',
    desc: 'text-amber-800/90',
    glow: 'from-amber-400/30 to-yellow-400/20',
    defaultIcon: <AlertTriangle className="w-8 h-8" />
  },
  info: {
    bg: 'bg-gradient-to-br from-cyan-50/95 to-blue-50/80',
    border: 'border-cyan-200/70',
    iconBg: 'bg-cyan-100/80',
    icon: 'text-cyan-700',
    title: 'text-cyan-950',
    desc: 'text-cyan-800/90',
    glow: 'from-cyan-400/25 to-blue-400/15',
    defaultIcon: <Info className="w-8 h-8" />
  },
  emergency: {
    bg: 'bg-gradient-to-br from-red-50/95 via-rose-50/85 to-rose-100/80',
    border: 'border-rose-300/90',
    iconBg: 'bg-rose-100/80',
    icon: 'text-red-800',
    title: 'text-red-950',
    desc: 'text-red-900/90',
    glow: 'from-rose-500/45 to-red-500/35',
    defaultIcon: <HeartPulse className="w-8 h-8 animate-pulse" />
  }
};

const buttonVariants = {
  primary: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 hover:from-cyan-700 hover:via-blue-700 hover:to-cyan-800 text-white shadow-cyan-500/30',
  secondary: 'bg-white/90 backdrop-blur-md border-2 border-slate-200/80 text-slate-800 hover:border-cyan-400',
  danger: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:via-red-700 text-white shadow-rose-500/40',
  ghost: 'bg-transparent border border-slate-200/50 text-slate-700 hover:bg-slate-100/80'
};

export default function MedicalAlertWithActions({
  type = 'info',
  title,
  description,
  brandSource,
  lastSync,
  icon,
  actions = [],
  confidence,
  className = '',
  pulse = type === 'emergency' || type === 'warning'
}: MedicalAlertWithActionsProps) {
  const styles = alertStyles[type];
  const brand = brandSource ? brandIdentity[brandSource] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`rounded-[2.5rem] border-2 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group ${styles.bg} ${styles.border} ${className}`}
    >
      {/* 1. Glow Perimetral Reactivo */}
      <div 
        className={`absolute -inset-24 bg-gradient-to-br ${styles.glow} blur-[100px] opacity-60 transition-all duration-1000 ${pulse ? 'animate-pulse' : ''}`} 
        style={{ pointerEvents: 'none' }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        
        {/* 2. Badge de Ecosistema "Ready" */}
        {brand && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 bg-white/60 rounded-lg border border-white/40 shadow-sm ${brand.color}`}>
              {brand.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 leading-none">
                {brand.label} Sync Active
              </span>
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                Last Update: {lastSync || 'Real-time'}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start gap-6">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`flex-shrink-0 p-5 rounded-[1.5rem] ${styles.iconBg} border border-white/40 shadow-inner ${styles.icon}`}
          >
            {icon || styles.defaultIcon}
          </motion.div>

          <div className="flex-1 space-y-2">
            <h3 className={`text-2xl md:text-3xl font-black tracking-tighter leading-tight uppercase italic ${styles.title}`}>
              {title}
            </h3>
            <p className={`text-base md:text-lg leading-relaxed font-light ${styles.desc}`}>
              {description}
            </p>

            {/* 3. Helena Reasoning Confidence */}
            {confidence !== undefined && (
              <div className="mt-6 pt-4 border-t border-black/5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  <span>Helena Confidence Matrix</span>
                  <span className={confidence > 0.9 ? 'text-emerald-600' : 'text-amber-600'}>
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={`h-full bg-gradient-to-r ${type === 'emergency' ? 'from-rose-500 to-red-600' : 'from-cyan-400 to-blue-500'}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Bloque de Acciones */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/5">
            {actions.map((action, index) => (
              <motion.button
                key={`${action.label}-${index}`}
                onClick={action.onClick}
                disabled={action.disabled}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all shadow-lg ${buttonVariants[action.variant || 'secondary']}`}
              >
                {action.icon && <span className="w-5 h-5 opacity-90">{action.icon}</span>}
                <span>{action.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}