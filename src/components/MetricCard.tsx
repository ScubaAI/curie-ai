'use client';

import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  User,
  Heart,
  Scale,
  Zap,
  Timer,
  Thermometer,
  Wind,
  Droplets,
  Flame,
  Moon,
  Sun,
  Stethoscope,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';

// Icon mapping for string-based icon prop
const iconMap: Record<string, LucideIcon> = {
  Activity,
  User,
  Heart,
  Scale,
  Zap,
  Timer,
  Thermometer,
  Wind,
  Droplets,
  Flame,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Stethoscope,
  Minus,
};

interface MetricCardProps {
  label: string;
  value: string | number | null | undefined;
  unit: string;
  icon?: string | LucideIcon;
  color?: 'cyan' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate';

  trend?: {
    value: number;
    isUp: boolean;
    rawDiff?: number;
    inverseTrend?: boolean;
    label?: string;
  };
  description?: string;
  size?: 'normal' | 'large';
  highlight?: boolean;
  alert?: boolean;
  clinicalContext?: string;
  timestamp?: boolean; // Nueva: mostrar hora de actualización
}

// Tailwind safelist reference (for build-time preservation):
// bg-cyan-400 bg-emerald-400 bg-rose-400 bg-amber-400 bg-violet-400 bg-slate-400
// text-cyan-400 text-emerald-400 text-rose-400 text-amber-400 text-violet-400 text-slate-400

function getIconComponent(icon: string | LucideIcon | undefined): LucideIcon {
  if (!icon) return Activity;
  if (typeof icon === 'string') {
    return iconMap[icon] || Activity;
  }
  return icon;
}

function getGlowColor(color: string): string {
  const glowMap: Record<string, string> = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400',
    amber: 'bg-amber-400',
    violet: 'bg-violet-400',
    slate: 'bg-slate-400',
  };
  return glowMap[color] || 'bg-cyan-400';
}

function getTextColor(color: string): string {
  const textMap: Record<string, string> = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
    slate: 'text-slate-400',
  };
  return textMap[color] || 'text-cyan-400';
}

export default function MetricCard({
  label,
  value,
  unit,
  icon,
  color = 'cyan',
  trend,
  description,
  size = 'normal',
  highlight = false,
  alert = false,
  clinicalContext,
  timestamp = false,
}: MetricCardProps) {
  const Icon = getIconComponent(icon);
  const glowColorClass = getGlowColor(color);
  const textColorClass = getTextColor(color);

  // Lógica de tendencia refinada
  const getTrendStatus = () => {
    if (!trend || trend.value === 0) return 'neutral';
    const isPositive = trend.inverseTrend ? !trend.isUp : trend.isUp;
    return isPositive ? 'positive' : 'negative';
  };

  const trendStatus = getTrendStatus();
  const TrendIcon = trendStatus === 'neutral' ? Minus : trend?.isUp ? TrendingUp : TrendingDown;
  const trendColorClass = trendStatus === 'neutral'
    ? 'text-slate-500'
    : trendStatus === 'positive'
      ? 'text-emerald-500'
      : 'text-rose-500';

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.98 }}
      className={`relative group backdrop-blur-xl border p-6 rounded-[2rem] overflow-hidden transition-all duration-300
        ${alert
          ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50 hover:shadow-[0_20px_40px_rgba(244,63,94,0.2)]'
          : highlight
            ? 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-[0_20px_40px_rgba(6,182,212,0.2)]'
            : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
        }
        ${size === 'large' ? 'p-8' : 'p-6'}
      `}
    >
      {/* Glow etéreo de fondo */}
      <div
        className={`absolute -right-4 -top-4 w-32 h-32 blur-[60px] opacity-10 transition-opacity duration-500 group-hover:opacity-25 ${glowColorClass}`}
      />

      {/* Alerta pulsatil */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4"
        >
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
        </motion.div>
      )}

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <span className={`text-slate-500 font-black uppercase tracking-[0.2em] block truncate
              ${size === 'large' ? 'text-[11px]' : 'text-[10px]'}`}
            >
              {label}
            </span>

            {/* TENDENCIA con lógica neutral */}
            {trend && (
              <div className="flex items-center gap-1.5 mt-2">
                <TrendIcon className={`w-3 h-3 ${trendColorClass}`} />
                <span className={`text-[10px] font-bold ${trendColorClass}`}>
                  {trend.value !== 0 && (
                    <>{trend.isUp ? '+' : '-'}{trend.value} {unit}</>
                  )}
                  {trend.value === 0 && (
                    <>Sin cambio</>
                  )}
                </span>
                {trend.label && trend.value !== 0 && (
                  <span className="text-[9px] text-slate-600">{trend.label}</span>
                )}
              </div>
            )}
          </div>

          <div className={`rounded-2xl bg-white/5 border border-white/5 shadow-inner flex-shrink-0 transition-colors duration-300 group-hover:bg-white/10
            ${size === 'large' ? 'p-3.5' : 'p-3'}
            ${alert ? 'text-rose-400' : textColorClass}`}
          >
            <Icon size={size === 'large' ? 24 : 20} strokeWidth={2.5} />
          </div>
        </div>

        {/* VALOR PRINCIPAL */}
        <div className="flex items-baseline gap-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`font-light text-white tracking-tighter italic
              ${size === 'large' ? 'text-5xl' : 'text-4xl'}`}
          >
            {value ?? '—'}
          </motion.span>
          <span className="text-slate-600 text-xs font-mono uppercase tracking-widest italic">
            {unit}
          </span>
        </div>

        {/* DESCRIPCIÓN */}
        {description && (
          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed border-t border-white/5 pt-3">
            {description}
          </p>
        )}

        {/* CONTEXTO CLÍNICO */}
        {clinicalContext && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-3 pt-3 border-t border-amber-500/20 flex items-start gap-2 text-xs text-amber-400"
          >
            <Stethoscope className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{clinicalContext}</span>
          </motion.div>
        )}

        {/* LÍNEA DECORATIVA */}
        <div className={`mt-4 h-[1px] w-full bg-gradient-to-r from-transparent 
          ${highlight ? 'via-cyan-500/20' : 'via-white/10'} 
          to-transparent`}
        />
      </div>

      {/* TIMESTAMP ETÉREO (opcional) */}
      {timestamp && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-40 transition-opacity duration-300"
        >
          <span className="text-[9px] text-slate-600 font-mono tracking-wider">
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}