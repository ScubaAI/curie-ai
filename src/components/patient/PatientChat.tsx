'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Sparkles, HeartPulse, Watch, AlertTriangle, ChevronDown } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

interface PatientChatProps {
  patientId: string;
  hasWithings: boolean;
  compositions: any[];
  patientData: {
    id: string;
    name: string | null;
    age: number | null;
    height: number | null;
    targetWeight: number | null;
  };
}

export default function PatientChat({
  patientId,
  hasWithings,
  compositions,
  patientData
}: PatientChatProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Por defecto grande y abierto
  const [showBanner, setShowBanner] = useState(!hasWithings);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const latestComposition = compositions[0] ?? null;

  const telemetry = {
    date: latestComposition?.date || new Date().toISOString(),
    bpm: latestComposition?.heartRate || 72,
    weight: latestComposition?.weight || 0,
    muscleMass: latestComposition?.smm || 0,
    bodyFat: latestComposition?.pbf || 0,
    fatMass: latestComposition?.bodyFatMass || 0,
    bmr: latestComposition?.bmr || 0,
    metabolicAge: latestComposition?.metabolicAge || 0,
    hasRealtimeData: hasWithings,
    dataSource: hasWithings ? 'withings' : 'inbody',
    lastMeasurement: latestComposition?.date || null,
  };

  const chatPatientData = {
    id: patientData.id,
    name: patientData.name,
    age: patientData.age,
    height: patientData.height,
    targetWeight: patientData.targetWeight,
    compositions,
    hasWithings,
  };

  // Auto-scroll suave cuando se expande
  useEffect(() => {
    if (isExpanded && chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isExpanded]);

  return (
    <section className="space-y-6 relative">
      {/* Header del chat – invitador, con glow sutil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-blue-600/20 flex items-center justify-center border border-cyan-500/30 backdrop-blur-xl">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Habla con Curie
            </h2>
            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
              <HeartPulse className="w-4 h-4 text-emerald-400 animate-pulse" />
              Tu compañera médica personal • Siempre despierta
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-all"
        >
          <ChevronDown
            className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Banner de datos – más elegante y discreto */}
      <AnimatePresence>
        {showBanner && !hasWithings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-cyan-950/60 to-slate-900/60 border border-cyan-800/30 rounded-2xl p-5 flex items-center gap-5 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 bg-cyan-900/30 rounded-xl border border-cyan-700/20">
              <Activity className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-200 font-medium">
                Modo análisis basado en InBody
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Usando tus {compositions.length} mediciones guardadas.
                Conecta Withings para monitoreo en tiempo real y alertas instantáneas.
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenedor del chat – grande, inmersivo, con glow médico */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative rounded-3xl overflow-hidden border border-cyan-500/15 bg-gradient-to-b from-slate-950/90 to-black/80 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40"
            style={{ height: 'min(80vh, 800px)' }} // Más grande y responsivo
          >
            {/* Overlay sutil de grid médico para profundidad */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(6,182,212,0.04)_0%,transparent_50%)] pointer-events-none" />

            <div ref={chatContainerRef} className="h-full">
              <ChatInterface
                telemetry={telemetry}
                patientData={chatPatientData}
                isEmergency={false}
                newEvents={[]}
              />
            </div>

            {/* Mini status bar abajo */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-950/70 border-t border-cyan-900/30 backdrop-blur-xl flex items-center px-6 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Curie está escuchando • {hasWithings ? 'Datos en tiempo real' : 'Última medición analizada'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini teaser cuando está colapsado */}
      {!isExpanded && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsExpanded(true)}
          className="w-full py-6 bg-gradient-to-r from-cyan-950/60 to-slate-900/60 border border-cyan-800/30 rounded-2xl text-center hover:border-cyan-600/50 transition-all group"
        >
          <div className="flex items-center justify-center gap-4">
            <Cpu className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <div>
              <p className="text-lg font-semibold text-white">Continúa tu conversación con Curie</p>
              <p className="text-sm text-slate-400">Tu salud merece esta atención constante</p>
            </div>
          </div>
        </motion.button>
      )}
    </section>
  );
}