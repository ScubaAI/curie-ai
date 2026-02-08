/**
 * Curie Privacy Commitment
 * Protocolos de cifrado y manejo de bio-data.
 */

'use client';

import { useState } from 'react';
import { Lock, EyeOff, Server, UserCheck, ChevronDown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 border-t border-white/5 pt-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group py-4 px-6 rounded-2xl hover:bg-white/[0.02] transition-all"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            <Lock className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Protocolo de Privacidad Nexus</h3>
            <p className="text-[10px] text-slate-500 font-mono italic">E2EE + HIPAA Inspired Framework</p>
          </div>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-900/20 rounded-[2rem] border border-white/5 mt-4">
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <EyeOff className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Anonimización Biométrica</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Las consultas a la IA se realizan mediante tokens anonimizados. Curie procesa tendencias fisiológicas sin vincular directamente su identidad legal en la capa de inferencia.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Server className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Soberanía de Datos</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Su historial de buceo y farmacología se almacena en una base de datos encriptada (AES-256). Usted es el único dueño de su "Bio-Vault".
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <UserCheck className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Derecho al Olvido</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Implementamos una purga atómica de registros. Al solicitar la eliminación, se borran todas las métricas de telemetría y logs de chat de forma permanente.
                    </p>
                  </div>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-3 w-3 text-cyan-400" />
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">Sandbox Status</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal italic">
                    Nota: Visionary AI es una plataforma de investigación técnica. Aunque seguimos estándares de grado médico, no debe utilizarse para transmitir datos quirúrgicos de emergencia en tiempo real fuera de este entorno controlado.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
