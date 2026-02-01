'use client';
import { motion } from 'framer-motion';
import { Download, Utensils, Dumbbell, Zap } from 'lucide-react';

export default function ProtocolModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-10 relative shadow-[0_0_50px_rgba(0,255,255,0.1)]"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white uppercase text-[10px] tracking-widest font-bold">Cerrar [X]</button>

        <header className="mb-12">
          <h2 className="text-4xl font-black italic text-white tracking-tighter mb-2 uppercase">Protocolo de Optimización Biométrica</h2>
          <p className="text-cyan-400 font-mono text-[10px] tracking-[0.4em] uppercase">Fase 2: Definición & Densidad Muscular</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* DIETA CHANKO-NABE */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <Utensils size={20} />
              <h3 className="font-bold uppercase tracking-widest text-sm">Nutrición de Élite</h3>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Basado en Chanko-nabe tradicional: Alta biodisponibilidad de aminoácidos y grasas estructurales."
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono border-b border-white/5 py-1">
                  <span className="text-slate-500">PROTEÍNA</span>
                  <span className="text-white">450G</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono border-b border-white/5 py-1">
                  <span className="text-slate-500">GRASAS (LÍPIDOS)</span>
                  <span className="text-white">480G</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono py-1">
                  <span className="text-slate-500">DENSIDAD CALÓRICA</span>
                  <span className="text-white">~1,800 KCAL/PLATO</span>
                </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold py-3 rounded-xl border border-white/10 transition-all uppercase tracking-widest">
                <Download size={14} /> Descargar Guía Chanko
              </button>
            </div>
          </div>

          {/* RUTINA DE GYM */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-cyan-400">
              <Dumbbell size={20} />
              <h3 className="font-bold uppercase tracking-widest text-sm">Acondicionamiento Físico</h3>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase mb-1">Fuerza Máxima</p>
                  <p className="text-xs text-slate-300">Enfoque en compuestos: Squats, Deadlifts, Overheads.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-[10px] font-bold text-white uppercase mb-1">Hipertrofia Metabólica</p>
                  <p className="text-xs text-slate-300">Rango 8-12 reps con control excéntrico acentuado.</p>
                </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 bg-cyan-500 text-black text-[10px] font-bold py-3 rounded-xl hover:bg-white transition-all uppercase tracking-widest">
                <Download size={14} /> Descargar Rutina Gym
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
