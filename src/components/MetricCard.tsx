'use client';

import { LucideIcon, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  // Props originales (mantener compatibilidad)
  title?: string;           // Legacy support
  label?: string;           // Nueva preferencia
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color?: string;
  
  // Props nuevas
  trend?: {
    value: number;
    isUp: boolean;          // Cambiado de isPositive para consistencia
    rawDiff?: number;
  };
  description?: string;     // Texto explicativo debajo
  size?: 'normal' | 'large';
  highlight?: boolean;      // Glow especial si es óptimo
  inverseTrend?: boolean;   // true = verde si baja (para grasa)
  alert?: boolean;          // Modo alerta visual
}

export default function MetricCard({ 
  title,
  label,
  value, 
  unit, 
  icon: Icon, 
  color = 'text-cyan-400',
  trend,
  description,
  size = 'normal',
  highlight = false,
  inverseTrend = false,
  alert = false
}: MetricCardProps) {
  
  // Usar label si existe, sino title (backward compatibility)
  const displayTitle = label || title || 'Métrica';
  
  // Calcular si la tendencia es "buena" o "mala"
  const isTrendPositive = trend ? (
    inverseTrend ? !trend.isUp : trend.isUp
  ) : false;

  // Clases de color dinámicas
  const colorBase = color.replace('text-', '');
  const bgGlowClass = `bg-${colorBase}`;
  
  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative group backdrop-blur-xl border p-6 rounded-[2rem] overflow-hidden transition-all
        ${alert 
          ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50 hover:shadow-[0_20px_40px_rgba(244,63,94,0.2)]' 
          : highlight
            ? 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-[0_20px_40px_rgba(6,182,212,0.2)]'
            : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
        }
        ${size === 'large' ? 'p-8' : 'p-6'}
      `}
    >
      {/* Glow de fondo */}
      <div className={`absolute -right-4 -top-4 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-25 ${bgGlowClass}`} />
      
      {/* Alerta overlay */}
      {alert && (
        <div className="absolute top-4 right-4">
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>
      )}

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <span className={`text-slate-500 font-black uppercase tracking-[0.2em] block
              ${size === 'large' ? 'text-[11px]' : 'text-[10px]'}`}
            >
              {displayTitle}
            </span>
            
            {/* TENDENCIA */}
            {trend && (
              <div className="flex items-center gap-1.5 mt-2">
                {trend.isUp ? (
                  <TrendingUp className={`w-3 h-3 ${isTrendPositive ? 'text-emerald-500' : 'text-rose-500'}`} />
                ) : (
                  <TrendingDown className={`w-3 h-3 ${isTrendPositive ? 'text-emerald-500' : 'text-rose-500'}`} />
                )}
                <span className={`text-[10px] font-bold ${isTrendPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trend.isUp ? '+' : '-'}{trend.value} {unit}
                </span>
                <span className="text-[9px] text-slate-600">vs anterior</span>
              </div>
            )}
          </div>
          
          <div className={`rounded-2xl bg-white/5 border border-white/5 shadow-inner flex-shrink-0
            ${size === 'large' ? 'p-3.5' : 'p-3'}
            ${alert ? 'text-rose-400' : color}`}
          >
            <Icon size={size === 'large' ? 24 : 20} strokeWidth={2.5} />
          </div>
        </div>

        {/* VALOR PRINCIPAL */}
        <div className="flex items-baseline gap-2">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-light text-white tracking-tighter italic
              ${size === 'large' ? 'text-5xl' : 'text-4xl'}`}
          >
            {value}
          </motion.span>
          <span className="text-slate-600 text-xs font-mono uppercase tracking-widest italic">
            {unit}
          </span>
        </div>

        {/* DESCRIPCIÓN (nueva) */}
        {description && (
          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed border-t border-white/5 pt-3">
            {description}
          </p>
        )}

        {/* Línea decorativa */}
        <div className={`mt-4 h-[1px] w-full bg-gradient-to-r from-transparent 
          ${highlight ? 'via-cyan-500/20' : 'via-white/10'} 
          to-transparent`} 
        />
      </div>
    </motion.div>
  );
}