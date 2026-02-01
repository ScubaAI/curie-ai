'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Heart, Zap, Scale, 
  ShieldCheck, Wind, ChevronRight, X, Cpu 
} from 'lucide-react';
import MedicalAlertWithActions from '@/components/MedicalAlertWithActions';
import ProtocolModal from '@/components/ProtocolModal';
import ChatInterface from '@/components/ChatInterface';
import HeroVideo from '@/components/HeroVideo';
import BlinkPayment from '@/components/BlinkPayment';
import patientHistory from '@/data/abraham-history.json';

export default function PatientDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);

  // Extraemos la medición más reciente
  const latestInBody = patientHistory.composition_history.find(h => h.is_latest) || patientHistory.composition_history[patientHistory.composition_history.length - 1];

  // Telemetría dinámica basada en datos reales del InBody + fallback
  const currentTelemetry = { 
    bpm: patientHistory.biometrics_snapshot.bpm ?? 62,
    hrv: patientHistory.biometrics_snapshot.hrv ?? 78,
    spo2: patientHistory.biometrics_snapshot.spo2 ?? 99,
    weight: latestInBody?.weight ?? 68.0,
    muscleMass: latestInBody?.smm ?? 31.5,
    bodyWater: latestInBody?.total_body_water ?? 40.8,
    visceralFat: latestInBody?.vfl ?? 5,
    bmr: latestInBody?.bmr ?? 1570,
    target: 80.0,
    phaseAngle: latestInBody?.phase_angle ?? 7.1,
    pbf: latestInBody?.pbf ?? 18.3
  };

  // Progreso hacia 80 kg (con narrativa de urgencia)
  const progress = Math.min(100, Math.round((currentTelemetry.weight / currentTelemetry.target) * 100));
  const progressText = progress >= 85 ? '85%' : `${progress}% – hambre de más`;

  return (
    <div className="min-h-screen bg-black text-slate-200 p-6 lg:p-12 space-y-10">
      
      {/* HEADER TÉCNICO */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-mono text-xs tracking-[0.3em] text-slate-500 uppercase">
            Curie Autonomy v1.0 // Active Monitoring
          </span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2 bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Link
        </div>
      </header>

      {/* HERO VIDEO – belleza en movimiento */}
      <HeroVideo />

      {/* ALERTA RIKISHI – éxito absoluto */}
      <section>
        <MedicalAlertWithActions
          type="success"
          title="Protocolo perzonalizado: Fase de Definición Muscular"
          description="Curie ha validado la transición metabólica: Iniciando fase de recomposición estética hacia el objetivo de 80kg con densidad muscular superior."
          confidence={0.99}
          actions={[
            {
              label: 'Ver Protocolo Nutrición & Gym',
              variant: 'primary',
              icon: <Activity className="w-4 h-4" />,
              onClick: () => setIsProtocolOpen(true)
            }
          ]}
        />
      </section>

      {/* BIOMÉTRICOS PRINCIPALES – dinámicos */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Ritmo Cardíaco" value={currentTelemetry.bpm} unit="BPM" icon={<Heart className="text-rose-500" />} />
        
        <div className="relative group">
          <MetricCard title="Peso (InBody)" value={currentTelemetry.weight} unit="kg" icon={<Scale className="text-emerald-500" />} />
          <span className="absolute -top-2 right-4 bg-slate-800 text-[8px] px-2 py-0.5 rounded border border-white/10 text-slate-400">
            Última Lectura: {latestInBody?.date || '27.09.2025'}
          </span>
        </div>
        
        <MetricCard title="Ángulo de Fase" value={currentTelemetry.phaseAngle} unit="°" icon={<Zap className="text-yellow-500" />} />
        <MetricCard title="Saturación O₂" value={currentTelemetry.spo2} unit="%" icon={<Wind className="text-cyan-500" />} />
      </section>

      {/* LABORATORIOS – tensión narrativa */}
      <section className="bg-slate-900/20 border border-dashed border-white/10 rounded-[2rem] p-8 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Módulo de Bioquímica Sangre</p>
        <p className="text-sm text-slate-400 italic">No hay resultados de laboratorio recientes vinculados al Nexus.</p>
        <button className="mt-4 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-white transition-all">
          Subir Reporte PDF (Próximamente)
        </button>
      </section>

      {/* COMPOSICIÓN Y ACCIÓN */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 lg:p-12">
          <h3 className="text-xl font-bold mb-10 flex items-center gap-3 italic tracking-tighter uppercase text-white">
            <Activity className="text-emerald-400 w-5 h-5" /> Evaluación de Composición Corporal
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <DataPoint label="Masa Muscular" value={currentTelemetry.muscleMass} unit="kg" highlight />
            <DataPoint label="Agua Total" value={currentTelemetry.bodyWater} unit="L" />
            <DataPoint label="Grasa Visceral" value={currentTelemetry.visceralFat} unit="lvl" />
            <DataPoint label="BMR" value={currentTelemetry.bmr} unit="kcal" />
          </div>
          
          <div className="mt-12">
            <div className="flex justify-between text-xs mb-3 text-slate-500 uppercase tracking-[0.2em] font-bold">
              <span>Ruta hacia 80kg (Target)</span>
              <span className="text-emerald-400">{progressText}</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full border border-white/10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              />
            </div>

            {/* Proyección de belleza – toque adictivo */}
            <div className="mt-8 text-center text-sm italic text-slate-300">
              Curie proyecta: <span className="text-cyan-400 font-bold">+4–6 kg masa muscular</span> en 12–16 semanas con dieta + 4100 kcal/día.  
              Densidad, vascularidad y simetría.
            </div>
          </div>
        </div>

        {/* ACCESO A CURIE CHAT – irresistible */}
        <motion.div 
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,211,238,0.3)" }}
          className="bg-gradient-to-br from-cyan-600/20 to-blue-800/20 backdrop-blur-md border border-cyan-500/30 rounded-[2.5rem] p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-3 italic tracking-tighter">CONSULTA CURIE</h3>
            <p className="text-slate-300 font-light italic text-base leading-relaxed">
              Análisis predictivo en tiempo real.
            </p>
          </div>
          <button className="relative z-10 self-start mt-8 bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-300 transition-colors uppercase text-xs tracking-widest shadow-lg">
            Abrir Ai medica <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* FOOTER – manifiesto eterno */}
      <footer className="mt-20 pt-20 border-t border-white/5 space-y-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            <h3 className="text-4xl font-black italic text-white tracking-tighter uppercase">Nuestra Misión</h3>
            <div className="space-y-8 text-slate-300 font-light leading-relaxed text-lg">
              <p>
                <strong className="text-cyan-400 font-medium italic block mb-1 text-[10px] tracking-[0.3em] uppercase">01. Autonomía Biológica</strong>
                Transformamos la gestión de la salud al devolver la soberanía del bienestar al dato clínico puro y accionable.
              </p>
              <p>
                <strong className="text-cyan-400 font-medium italic block mb-1 text-[10px] tracking-[0.3em] uppercase">02. Inteligencia de Convergencia</strong>
                InBody, telemetría de buceo y nutrición de alto rendimiento: unificamos fuentes heterogéneas en una visión fisiológica holística.
              </p>
              <p>
                <strong className="text-cyan-400 font-medium italic block mb-1 text-[10px] tracking-[0.3em] uppercase">03. Ciencia Abierta</strong>
                Establecemos un nuevo estándar de transparencia médica, donde los datos de Abraham impulsan el descubrimiento clínico global.
              </p>
            </div>
          </div>
          <BlinkPayment />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-4">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.5em]">
            Curie Autonomy // Protocolo GCM-2026
          </p>
          <div className="flex gap-6 text-[10px] text-slate-500 uppercase tracking-widest">
            <span>E2EE Active</span>
            <span className="text-emerald-500/50 underline decoration-emerald-500/20">Open Source Medical Data</span>
          </div>
        </div>
      </footer>

      {/* CHAT OVERLAY */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsChatOpen(false)} 
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40" 
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-950 border-l border-white/5 z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/30">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Curie Intelligence</h2>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatInterface telemetry={currentTelemetry} isEmergency={isEmergency} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PROTOCOL MODAL */}
      <ProtocolModal isOpen={isProtocolOpen} onClose={() => setIsProtocolOpen(false)} />
    </div>
  );
}

// SUB-COMPONENTES (sin cambios mayores, solo pulidos)
function MetricCard({ title, value, unit, icon }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-slate-900/30 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] transition-colors hover:border-cyan-500/30">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">{icon}</div>
      </div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-light text-white tracking-tighter">{value}</span>
        <span className="text-slate-600 text-sm font-light uppercase">{unit}</span>
      </div>
    </motion.div>
  );
}

function DataPoint({ label, value, unit, highlight }: any) {
  return (
    <div className="space-y-1.5">
      <p className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black">{label}</p>
      <p className={`text-2xl font-light tracking-tighter ${highlight ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-white'}`}>
        {value}<span className="text-xs ml-1 text-slate-600 font-mono italic">{unit}</span>
      </p>
    </div>
  );
}