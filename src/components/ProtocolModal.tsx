'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Utensils, Dumbbell, Zap, X, ShieldCheck, FileText } from 'lucide-react';

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProtocolModal({ isOpen, onClose }: ProtocolModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Overlay con desenfoque profundo */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-slate-900/50 border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 relative shadow-[0_0_80px_rgba(0,255,255,0.1)] backdrop-blur-md"
          >
            {/* Botón de Cierre Estilizado */}
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all group"
            >
              <X size={20} className="group-rotate-90 transition-transform" />
            </button>

            {/* Header Técnico */}
            <header className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-cyan-400 font-mono text-[10px] tracking-[0.4em] uppercase">
                  Encrypted Health Protocol v2.6
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
                Protocolo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Optimización</span>
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              
              {/* SECCIÓN NUTRICIÓN */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-emerald-400">
                  <div className="p-3 bg-emerald-400/10 rounded-2xl border border-emerald-400/20">
                    <Utensils size={24} />
                  </div>
                  <h3 className="font-black italic uppercase tracking-tight text-xl text-white">Nutrición de Élite</h3>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText size={60} />
                  </div>
                  
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    "Configuración macro-nutricional diseñada para maximizar la síntesis proteica post-entrenamiento bajo el modelo Helena AI."
                  </p>

                  <div className="space-y-4">
                    <MacroRow label="Proteína Bio-disponible" value="450G" />
                    <MacroRow label="Lípidos Estructurales" value="480G" />
                    <MacroRow label="Densidad Calórica" value="~1,800 KCAL" sub="per unit" />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-black text-[11px] font-black py-5 rounded-2xl transition-all uppercase tracking-widest shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                  >
                    <Download size={16} /> Descargar Dieta PDF
                  </motion.button>
                </div>
              </section>

              {/* SECCIÓN GYM */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-cyan-400">
                  <div className="p-3 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
                    <Dumbbell size={24} />
                  </div>
                  <h3 className="font-black italic uppercase tracking-tight text-xl text-white">Performance Lab</h3>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={60} />
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Fuerza Máxima</p>
                      <p className="text-xs text-slate-400 font-light">Enfoque en compuestos: Squats, Deadlifts.</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Hipertrofia Metabólica</p>
                      <p className="text-xs text-slate-400 font-light">Rango 8-12 reps. Control excéntrico 3:1.</p>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 bg-cyan-500 text-black text-[11px] font-black py-5 rounded-2xl transition-all uppercase tracking-widest shadow-[0_10px_20px_rgba(6,182,212,0.2)]"
                  >
                    <Download size={16} /> Descargar Rutina v2
                  </motion.button>
                </div>
              </section>
            </div>

            {/* Footer de Seguridad */}
            <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">
                Cifrado de extremo a extremo activo // Protocolo GCM-2026
              </p>
              <div className="flex gap-4">
                <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
                <Zap className="w-4 h-4 text-cyan-500/40" />
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MacroRow({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-2">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 text-right">
        <span className="text-lg font-light text-white italic">{value}</span>
        {sub && <span className="text-[8px] text-slate-600 uppercase">{sub}</span>}
      </div>
    </div>
  );
}