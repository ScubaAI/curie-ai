/**
 * MedicalAlertWithActions – Versión Final Consolidada 2026
 * * Fusión de alerta clínica + acciones inmediatas + confianza IA.
 * Implementa: Framer Motion para fluidez, Lucide para iconografía, 
 * y Tailwind para el "Glow" neuro-estético.
 */

'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle, Info, XCircle,
  HeartPulse, ShieldCheck, Zap, Activity, Phone
} from 'lucide-react';

// Tipos de alerta que definen el "Mood" emocional de Helena
export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'emergency';

// Estructura de acción para los botones integrados
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
  icon?: ReactNode;
  actions?: AlertAction[];
  confidence?: number;        // Porcentaje de certeza de la IA (0 a 1)
  className?: string;
  pulse?: boolean;            // Forzar pulso visual (automático en emergency)
}

// Configuración de estilos por tipo de alerta
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
  primary: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 hover:from-cyan-700 hover:via-blue-700 hover:to-cyan-800 text-white shadow-cyan-500/30 hover:shadow-cyan-500/50',
  secondary: 'bg-white/90 backdrop-blur-md border-2 border-slate-200/80 text-slate-800 hover:border-cyan-400 hover:bg-cyan-50/90 hover:shadow-cyan-400/20',
  danger: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:via-red-700 hover:to-rose-800 text-white shadow-rose-500/40 hover:shadow-rose-500/60',
  ghost: 'bg-transparent border border-slate-200/50 text-slate-700 hover:bg-slate-100/80 hover:text-cyan-700'
};

export default function MedicalAlertWithActions({
  type = 'info',
  title,
  description,
  icon,
  actions = [],
  confidence,
  className = '',
  pulse = type === 'emergency' || type === 'warning'
}: MedicalAlertWithActionsProps) {
  const styles = alertStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`rounded-[2.5rem] border-2 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group ${styles.bg} ${styles.border} ${className}`}
      role="alert"
    >
      {/* 1. Capa de Resplandor (Glow) Perimetral */}
      <div 
        className={`absolute -inset-24 bg-gradient-to-br ${styles.glow} blur-[100px] opacity-60 group-hover:opacity-100 transition-all duration-1000 ${pulse ? 'animate-pulse' : ''}`} 
        style={{ pointerEvents: 'none' }}
      />

      <div className="relative z-10 flex flex-col gap-8">
        
        {/* 2. Cabecera Clínica: Icono + Títulos */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex-shrink-0 p-5 rounded-[1.5rem] ${styles.iconBg} border border-white/40 shadow-inner ${styles.icon}`}
          >
            {icon || styles.defaultIcon}
          </motion.div>

          <div className="flex-1 space-y-3">
            <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight leading-tight ${styles.title}`}>
              {title}
            </h3>
            <p className={`text-base md:text-lg leading-relaxed font-light ${styles.desc}`}>
              {description}
            </p>

            {/* 3. Indicador de Confianza IA (Si aplica) */}
            {confidence !== undefined && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <span>Helena Reasoning Confidence</span>
                  <span className={confidence > 0.9 ? 'text-emerald-600' : 'text-amber-600'}>
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden shadow-inner">
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

        {/* 4. Bloque de Acciones (Botones) */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20">
            {actions.map((action, index) => (
              <motion.button
                key={`${action.label}-${index}`}
                onClick={action.onClick}
                disabled={action.disabled}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-base shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-offset-2 ${buttonVariants[action.variant || 'secondary']}`}
              >
                {action.icon && <span className="w-5 h-5 opacity-90">{action.icon}</span>}
                <span>{action.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Marca de Agua de Seguridad sutil */}
      <div className="absolute bottom-4 right-6 opacity-20 pointer-events-none">
        <ShieldCheck className="w-6 h-6 text-slate-400" />
      </div>

    </motion.div>
  );
}
