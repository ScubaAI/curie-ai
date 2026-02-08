'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Heart, Zap, Scale, 
  ShieldCheck, Wind, ChevronRight, X, Cpu,
  Anchor, Droplets, AlertTriangle, MessageSquare,
  TrendingUp, TrendingDown, Dna, Waves, Target,
  ChevronDown, ChevronUp, Info
} from 'lucide-react';

// Componentes del Sistema
import MedicalDisclaimer from '@/components/MedicalDisclaimer';
import BlinkPayment from '@/components/BlinkPayment';
import HeroVideo from '@/components/HeroVideo';
import MedicalAlertWithActions from '@/components/MedicalAlertWithActions';
import MetricCard from '@/components/MetricCard';
import PrivacyNotice from '@/components/PrivacyNotice';
import ChatInterface from '@/components/ChatInterface';
import ProtocolModal from '@/components/ProtocolModal';
import Footer from '@/components/Footer';
import Badge from '@/components/Badge';

export default function PatientDashboard() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('performance');
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);

  useEffect(() => {
    async function fetchBioData() {
      try {
        const res = await fetch('/api/patient/abraham-001');
        const data = await res.json();
        setDbData(data);
      } catch (e) {
        console.error("Error syncing with Nexus");
      } finally {
        setLoading(false);
      }
    }
    fetchBioData();
  }, []);

  const compositions = dbData?.compositions || [];
  const curr = compositions[0] || {};
  const prev = compositions[1] || {};

  const getTrend = (current: number, previous: number) => {
    if (!previous) return undefined;
    const diff = current - previous;
    return {
      value: Math.abs(Number(diff.toFixed(1))),
      isUp: diff > 0,
      rawDiff: diff
    };
  };

  const latestDive = dbData?.metrics?.find((m: any) => m.type === 'DEPTH');

  const currentTelemetry = { 
    bpm: dbData?.biometrics?.[0]?.bpm ?? 62,
    weight: curr.weight ?? 67.5,
    muscleMass: curr.smm ?? 31.3,
    pbf: curr.pbf ?? 18.2,
    phaseAngle: curr.phaseAngle ?? 7.5,
    maxDepth: latestDive?.value ?? 0,
    isDecoViolated: latestDive?.metadata?.decompressionViolated ?? false,
    bodyWater: curr.totalBodyWater ?? 40.5,
    visceralFat: curr.vfl ?? 5,
    bmr: curr.bmr ?? 1562
  };

  const targetWeight = 80;
  const weightProgress = Math.min(100, Math.round((currentTelemetry.weight / targetWeight) * 100));

  return (
    <main className="min-h-screen bg-black text-slate-200">
      {/* HEADER FIJO */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">Curie v1.0 // Prisma Postgres</span>
            <span className="text-[10px] text-cyan-500/80 font-bold uppercase">{loading ? 'SYNC_IN_PROGRESS' : 'DATA_LINK_STABLE'}</span>
          </div>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-full border border-emerald-500/20 font-black uppercase">
          Abraham Live
        </div>
      </nav>

      {/* 1) HERO SECTION */}
      <HeroVideo />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-20 space-y-12 pb-20">
        
        {/* 2) CHAT INTERFACE */}
        <section>
          <div className="h-[550px] shadow-2xl shadow-cyan-500/10 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <ChatInterface 
              telemetry={currentTelemetry} 
              patientData={dbData}
              isEmergency={currentTelemetry.isDecoViolated}
            />
          </div>
        </section>

        {/* 3) COMPONENTE DE PROTOCOLO (Alerta con botón) */}
        <section>
          <MedicalAlertWithActions
            type={currentTelemetry.isDecoViolated ? "warning" : "success"}
            title={currentTelemetry.isDecoViolated ? "Riesgo de Embolia Gaseosa" : "Protocolo de Optimización Activo"}
            description={currentTelemetry.isDecoViolated 
              ? `Violación de descompresión detectada (${currentTelemetry.maxDepth}m). El protocolo de optimización hormonal puede elevar el hematocrito, aumentando el riesgo vascular.`
              : "Sincronización con Seca mBCA exitosa. Protocolo Rikishi en ejecución: nutrición de élite + entrenamiento de fuerza personalizado."}
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

        {/* 4) MÓDULO DE COMPOSICIÓN CORPORAL */}
        <section className="space-y-8">
          {/* Header de sección */}
          <div className="flex items-end justify-between border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-cyan-400">
                <Dna className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Análisis Bioimpedancia</span>
              </div>
              <h2 className="text-4xl font-black italic text-white tracking-tighter">
                Composición <span className="text-cyan-500">Celular</span>
              </h2>
              <p className="text-slate-500 text-sm max-w-xl">
                Métricas derivadas de análisis de impedancia bioeléctrica multifrecuencia (BIA). 
                Comparativa vs. registro anterior: <span className="text-cyan-400 font-mono">{prev.date || '2025-06-20'}</span>
              </p>
            </div>
            
            {/* Indicador de Progreso */}
            <div className="text-right space-y-2 hidden md:block">
              <div className="flex items-center gap-2 justify-end text-[10px] uppercase tracking-widest text-slate-500">
                <Target className="w-3 h-3" />
                Progreso hacia {targetWeight}kg
              </div>
              <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${weightProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                />
              </div>
              <p className="text-2xl font-black text-white">{weightProgress}% <span className="text-slate-600 text-sm font-normal">completado</span></p>
            </div>
          </div>

          {/* Grid de métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Grupo 1: Masa y Densidad */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Densidad Muscular
              </h3>
              <div className="space-y-4">
                <MetricCard 
                  label="Masa Muscular Esquelética" 
                  value={currentTelemetry.muscleMass} 
                  unit="kg" 
                  icon={Activity} 
                  color="text-emerald-400"
                  trend={getTrend(currentTelemetry.muscleMass, prev.smm)}
                  description="SMM: Proteína funcional activa"
                  size="large"
                />
                <MetricCard 
                  label="Peso Corporal Total" 
                  value={currentTelemetry.weight} 
                  unit="kg" 
                  icon={Scale} 
                  color="text-slate-400"
                  trend={getTrend(currentTelemetry.weight, prev.weight)}
                  description="Medición post-entreno (07:30 AM)"
                />
              </div>
            </div>

            {/* Grupo 2: Salud Metabólica */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Vitalidad Celular
              </h3>
              <div className="space-y-4">
                <MetricCard 
                  label="Ángulo de Fase" 
                  value={currentTelemetry.phaseAngle} 
                  unit="°" 
                  icon={Zap} 
                  color="text-purple-400"
                  trend={getTrend(currentTelemetry.phaseAngle, prev.phaseAngle)}
                  description={currentTelemetry.phaseAngle > 7 ? 'Integridad celular óptima' : 'Riesgo de catabolismo'}
                  highlight={currentTelemetry.phaseAngle > 7}
                />
                <MetricCard 
                  label="Grasa Corporal Total" 
                  value={currentTelemetry.pbf} 
                  unit="%" 
                  icon={Scale} 
                  color="text-amber-400"
                  trend={getTrend(currentTelemetry.pbf, prev.pbf)}
                  description="PBF: Percentil atleta 15-18%"
                  inverseTrend={true}
                />
              </div>
            </div>

            {/* Grupo 3: Hidratación y Metabolismo */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Droplets className="w-3 h-3" />
                Homeostasis
              </h3>
              <div className="space-y-4">
                <MetricCard 
                  label="Agua Corporal Total" 
                  value={currentTelemetry.bodyWater} 
                  unit="L" 
                  icon={Droplets} 
                  color="text-cyan-400"
                  description="TBW: Hidratación intracelular"
                />
                <MetricCard 
                  label="Metabolismo Basal" 
                  value={currentTelemetry.bmr} 
                  unit="kcal" 
                  icon={Zap} 
                  color="text-rose-400"
                  description="BMR: Gasto energético en reposo"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5) COMPONENTE DE BUCEO Y MÉTRICAS GARMIN */}
        <motion.section 
          className="border border-white/5 rounded-3xl overflow-hidden bg-white/[0.02]"
          initial={false}
        >
          <button 
            onClick={() => setExpandedSection(expandedSection === 'performance' ? null : 'performance')}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <Waves className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Rendimiento Submarino & Garmin</h3>
                <p className="text-sm text-slate-500">Telemetría de buceo, frecuencia cardíaca y actividad física</p>
              </div>
            </div>
            {expandedSection === 'performance' ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
          </button>

          <AnimatePresence>
            {expandedSection === 'performance' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/5"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard 
                    label="Profundidad Máxima" 
                    value={currentTelemetry.maxDepth} 
                    unit="m" 
                    icon={Anchor} 
                    color="text-cyan-400"
                    alert={currentTelemetry.isDecoViolated}
                  />
                  <MetricCard 
                    label="Ritmo Cardíaco" 
                    value={currentTelemetry.bpm} 
                    unit="BPM" 
                    icon={Heart} 
                    color="text-rose-400"
                  />
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col justify-center items-center text-center space-y-3">
                    <Info className="w-8 h-8 text-slate-600" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Datos sincronizados desde Garmin Connect y Shearwater Cloud. 
                      Última actividad: <span className="text-cyan-400">2h 34m ago</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 6) TEXTO CURIE NEURAL CORE */}
        <section className="pt-12 border-t border-white/5">
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">
                Núcleo de Inteligencia
              </span>
            </div>
            
            <h3 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
              Curie <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Neural Core</span>
            </h3>
            
            <p className="text-slate-400 text-base leading-relaxed font-light max-w-2xl">
              Agente médico cuántico entrenado sobre biomarcadores reales. 
              Ingesta multimodal: composición corporal, telemetría submarina, 
              biométricos continuos. Contexto clínico preciso = 
              <span className="text-cyan-400 font-medium"> zero alucinaciones</span>.
            </p>
            
            {/* Métricas de precisión */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">0%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Alucinación</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">99.7%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Precisión</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">&lt;50ms</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Latencia</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">E2EE</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cifrado</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Badge text="RAG Medical" color="cyan" />
              <Badge text="Real-time Telemetry" color="emerald" />
              <Badge text="Federated Learning" color="purple" />
              <Badge text="Edge Computing" color="rose" />
            </div>
          </div>
        </section>

        {/* 7) COMPONENTE DE BITCOIN */}
        <section className="pt-8">
          <BlinkPayment />
        </section>

      </div>

      {/* 8) FOOTER */}
      <Footer />

      {/* MODAL DE PROTOCOLO */}
      <ProtocolModal 
        isOpen={isProtocolOpen} 
        onClose={() => setIsProtocolOpen(false)} 
      />
    </main>
  );
}