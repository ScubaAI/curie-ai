'use client';

import { useEffect, useState } from 'react';
import { Calendar, Video, Clock, CreditCard, Shield, X } from 'lucide-react';

interface CalSchedulingProps {
  calUsername: string;  // Tu usuario de Cal.com
  eventType: string;    // El slug de tu tipo de evento (ej: "consulta-medica")
}

export default function CalScheduling({ calUsername, eventType }: CalSchedulingProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Precargar el script de Cal.com solo cuando se abre
  useEffect(() => {
    if (!showModal) return;

    // Cargar Cal.com embed script
    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    script.async = true;
    script.type = 'text/javascript';
    
    // Asegurar que el script se cargue antes de mostrar
    script.onload = () => {
      // @ts-ignore - Cal.com añade su objeto global
      if (window.Cal) {
        // @ts-ignore
        window.Cal('init', { origin: 'https://cal.com' });
      }
    };
    
    document.body.appendChild(script);
    
    return () => {
      // No remover el script para mantener funcionalidad entre aperturas
    };
  }, [showModal]);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // URL de Cal.com con parámetros optimizados
  const calUrl = `https://cal.com/${calUsername}/${eventType}?embed=true&theme=dark&layout=month_view`;

  return (
    <>
      {/* Card principal - Vista previa */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/30 rounded-3xl p-8 lg:p-10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Header médico profesional */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3.5 bg-gradient-to-br from-emerald-900/40 to-teal-900/20 rounded-2xl border border-emerald-500/20">
            <Calendar size={24} className="text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-emerald-400">
              Agendar Consulta
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Videollamada segura con tu médico
            </p>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <Video size={18} className="text-teal-400" />
            <span className="text-sm text-slate-300">Video HD</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <Clock size={18} className="text-teal-400" />
            <span className="text-sm text-slate-300">30-60 min</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <CreditCard size={18} className="text-teal-400" />
            <span className="text-sm text-slate-300">Pago integrado</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">Disponible hoy</span>
          </div>
        </div>

        {/* Botón principal para abrir modal */}
        <button
          onClick={openModal}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.4)] uppercase tracking-wider text-sm flex items-center justify-center gap-3"
        >
          <Calendar size={18} />
          Ver Disponibilidad
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-700/30">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield size={14} className="text-emerald-500" />
            HIPAA Compliant
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            Encriptado E2E
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            Cancelación 24h
          </div>
        </div>
      </section>

      {/* Modal con Cal.com */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[85vh] bg-slate-950 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-emerald-400" />
                <span className="text-white font-medium">Selecciona fecha y hora</span>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* iframe de Cal.com */}
            <div className="relative w-full h-[calc(85vh-64px)]">
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-sm text-slate-400">Cargando calendario...</span>
                  </div>
                </div>
              )}
              <iframe
                src={calUrl}
                className="w-full h-full border-0"
                onLoad={() => setIsLoaded(true)}
                allow="camera; microphone; autoplay; encrypted-media; fullscreen"
                title="Cal.com Scheduling"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
