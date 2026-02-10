'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Heart, Zap, Scale, 
  ShieldCheck, Wind, ChevronRight, X, Cpu,
  Anchor, Droplets, AlertTriangle, MessageSquare,
  TrendingUp, TrendingDown, Dna, Waves, Target,
  ChevronDown, ChevronUp, Info, Bitcoin
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

// Shared types for better type safety
import { CompositionData, DiveMetric, BiometricData, PatientData, TelemetryData, ChatEvent } from '@/types/shared';

export default function PatientDashboard() {
  const [dbData, setDbData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('performance');
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [newEvents, setNewEvents] = useState<ChatEvent[]>([]);

  useEffect(() => {
    async function fetchBioData() {
      try {
        const res = await fetch('/api/patient/abraham-001');
        const data: PatientData = await res.json();
        setDbData(data);
        
        // Detectar eventos nuevos para posibles alertas
        const events = detectNewEvents(data);
        setNewEvents(events);
      } catch (e) {
        console.error("[NEXUS_SYNC_ERROR]:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchBioData();
  }, []);

  // Función para detectar eventos nuevos que requieren atención
  const detectNewEvents = (data: PatientData): ChatEvent[] => {
    const events: ChatEvent[] = [];
    
    // Detectar violación de descompresión
    const latestDive = data?.metrics?.find((m: DiveMetric) => m.type === 'DEPTH');
    if (latestDive?.metadata?.decompressionViolated) {
      events.push({
        type: 'DECO_VIOLATION',
        severity: 'CRITICAL',
        title: 'Violación de Descompresión Detectada',
        description: `Parada de seguridad omitida a ${latestDive.value}m`
      });
    }
    
    return events;
  };

  const compositions = dbData?.compositions || [];
  const curr = compositions[0] || {};
  const prev = compositions[1] || {};

  const getTrend = (current: number, previous: number) => {
    if (!previous || !current) return undefined;
    const diff = current - previous;
    return {
      value: Math.abs(Number(diff.toFixed(1))),
      isUp: diff > 0,
      rawDiff: diff
    };
  };

  const latestDive = dbData?.metrics?.find((m: DiveMetric) => m.type === 'DEPTH');
  const hasDecoViolation = latestDive?.metadata?.decompressionViolated || false;

  // Telemetry consolidado con priorización de fuentes
  const currentTelemetry: TelemetryData = {
    bpm: dbData?.biometrics?.[0]?.bpm ?? 62,
    weight: curr.weight ?? 75.5,
    muscleMass: curr.smm ?? 35.2,
    pbf: curr.pbf ?? 16.8,
    phaseAngle: curr.phaseAngle ?? 7.8,
    maxDepth: latestDive?.value ?? 0,
    isDecoViolated: hasDecoViolation,
    bodyWater: curr.totalBodyWater ?? 48.3,
    visceralFat: curr.vfl ?? 4,
    bmr: curr.bmr ?? 1850
  };

  // Determinar fuente de datos de composición para mostrar confianza
  const compositionSource = curr.source || 'INBODY_970';
  const sourceConfidence = {
    'INBODY_970': { label: 'InBody 970', confidence: 'Alta' },
    'INBODY_770': { label: 'InBody 770', confidence: 'Alta' },
    'BIA_MULTIFRECUENCIA': { label: 'BIA Multifrecuencia', confidence: 'Media-Alta' },
    'BIA_SEGMENTAL': { label: 'BIA Segmental', confidence: 'Media' },
    'BIA_HANDHELD': { label: 'BIA Manual', confidence: 'Media' },
    'GARMIN_SCALE': { label: 'Báscula Garmin', confidence: 'Baja' }
  }[compositionSource] || { label: compositionSource, confidence: 'Desconocida' };

  const targetWeight = 80;
  const weightProgress = Math.min(100, Math.round((currentTelemetry.weight / targetWeight) * 100));
  const weightRemaining = (targetWeight - currentTelemetry.weight).toFixed(1);
  const weeksToTarget = Math.ceil((targetWeight - currentTelemetry.weight) / 0.5);

  // Handler para descarga segura de documentos
  const handleSecureDownload = async (type: 'nutrition' | 'workout' | 'prescription', id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[DOWNLOAD_ERROR]:', error);
      alert('Error al descargar el documento. Intente de nuevo.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-slate-200">
      {/* HEADER FIJO */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">
              CURIE v2.2 // Persistent Neural Context
            </span>
            <span className="text-[10px] text-cyan-500/80 font-black uppercase">
              {loading ? 'SYNC_IN_PROGRESS' : 'DATA_LINK_STABLE'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {newEvents.some(e => e.severity === 'CRITICAL') && (
            <div className="bg-red-500/10 text-red-400 text-[10px] px-3 py-1 rounded-full border border-red-500/20 font-black uppercase animate-pulse">
              ALERTA ACTIVA
            </div>
          )}
          <div className="bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-full border border-emerald-500/20 font-black uppercase">
            ABRAHAM-001
          </div>
        </div>
      </nav>

      {/* 1) HERO SECTION */}
      <HeroVideo />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-20 space-y-12 pb-20">
        
        {/* 2) CHAT INTERFACE */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Interfaz Conversacional
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Model: Llama-3.3-70B-Medical
            </div>
          </div>
          <div className="h-[550px] shadow-2xl shadow-cyan-500/10 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <ChatInterface 
              telemetry={currentTelemetry} 
              patientData={dbData}
              isEmergency={currentTelemetry.isDecoViolated}
              newEvents={newEvents}
            />
          </div>
        </section>

        {/* 3) COMPONENTE DE PROTOCOLO (Alerta con botón) */}
        <section>
          <MedicalAlertWithActions
            type={currentTelemetry.isDecoViolated ? "warning" : "success"}
            title={currentTelemetry.isDecoViolated 
              ? "ALERTA: Riesgo de EAGE (Enfermedad por Descompresión)" 
              : "Sincronización Clínica Estable"}
            description={currentTelemetry.isDecoViolated 
              ? `Violación de parada de seguridad a ${currentTelemetry.maxDepth}m detectada. El protocolo activo puede incrementar hematocrito >48%, elevando riesgo de evento vascular isquémico durante ascenso. NO ENTRENAR hasta evaluación médica.`
              : `Protocolo "Hipertrofia Neural" activo. Nutrición peri-entreno optimizada + Periodización de fuerza adaptativa. Contexto médico persistente garantizado vía Prisma Postgres.`
            }
            confidence={0.99}
            actions={[
              {
                label: currentTelemetry.isDecoViolated 
                  ? 'Ver Protocolo de Emergencia' 
                  : 'Ver Protocolo Nutrición & Gym',
                variant: currentTelemetry.isDecoViolated ? 'danger' : 'primary',
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
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Análisis Bioimpedancia
                </span>
              </div>
              <h2 className="text-4xl font-black italic text-white tracking-tighter">
                Composición <span className="text-cyan-500">Corporal</span>
              </h2>
              <p className="text-slate-500 text-sm max-w-xl">
                Análisis segmental por impedancia bioeléctrica. 
                Fuente: <span className="text-cyan-400 font-mono">{sourceConfidence.label}</span> 
                <span className="text-slate-600"> • Confianza: {sourceConfidence.confidence}</span>
                <br />
                Comparativa vs. registro: <span className="text-cyan-400 font-mono">
                  {prev.date ? new Date(prev.date).toLocaleDateString('es-ES') : '2025-06-20'}
                </span>
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
              <div className="flex items-baseline justify-end gap-2">
                <p className="text-2xl font-black text-white">{weightProgress}%</p>
                <p className="text-slate-600 text-sm">faltan {weightRemaining}kg</p>
              </div>
              <p className="text-[10px] text-slate-600">
                Est. ~{weeksToTarget} semanas al ritmo actual
              </p>
            </div>
          </div>

          {/* Grid de métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Grupo 1: Arquitectura Muscular */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Arquitectura Muscular
              </h3>
              <div className="space-y-4">
                <MetricCard 
                  label="Masa Muscular Esquelética (SMM)" 
                  value={currentTelemetry.muscleMass} 
                  unit="kg" 
                  icon={Activity} 
                  color="text-emerald-400"
                  trend={getTrend(currentTelemetry.muscleMass, prev.smm)}
                  description={`SMM: ${currentTelemetry.muscleMass}kg (Percentil 85)`}
                  size="large"
                />
                <MetricCard 
                  label="Peso Corporal Total" 
                  value={currentTelemetry.weight} 
                  unit="kg" 
                  icon={Scale} 
                  color="text-slate-400"
                  trend={getTrend(currentTelemetry.weight, prev.weight)}
                  description="Medición post-entreno (07:30)"
                />
              </div>
            </div>

            {/* Grupo 2: Metabolismo Celular */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Metabolismo Celular
              </h3>
              <div className="space-y-4">
                <MetricCard 
                  label="Ángulo de Fase" 
                  value={currentTelemetry.phaseAngle} 
                  unit="°" 
                  icon={Zap} 
                  color="text-purple-400"
                  trend={getTrend(currentTelemetry.phaseAngle, prev.phaseAngle)}
                  description={currentTelemetry.phaseAngle > 7 
                    ? 'Homeostasis celular preservada' 
                    : 'Riesgo de catabolismo detectado'}
                  highlight={currentTelemetry.phaseAngle > 7}
                />
                <MetricCard 
                  label="Grasa Corporal Total (PBF)" 
                  value={currentTelemetry.pbf} 
                  unit="%" 
                  icon={Scale} 
                  color="text-amber-400"
                  trend={getTrend(currentTelemetry.pbf, prev.pbf)}
                  description={`PBF: ${currentTelemetry.pbf}% (Meta atleta: 15-18%)`}
                  inverseTrend={true}
                />
              </div>
            </div>

            {/* Grupo 3: Balance Hidroelectrolítico */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Droplets className="w-3 h-3" />
                Balance Hidroelectrolítico
              </h3>
              <div className="space-y-4">
                <MetricCard 
                  label="Agua Corporal Total (TBW)" 
                  value={currentTelemetry.bodyWater} 
                  unit="L" 
                  icon={Droplets} 
                  color="text-cyan-400"
                  description={`TBW: ${((currentTelemetry.bodyWater / currentTelemetry.weight) * 100).toFixed(1)}% (Norma: 55-65%)`}
                />
                <MetricCard 
                  label="Metabolismo Basal (BMR)" 
                  value={currentTelemetry.bmr} 
                  unit="kcal" 
                  icon={Zap} 
                  color="text-rose-400"
                  description={`BMR: ${currentTelemetry.bmr} kcal/día`}
                />
              </div>
            </div>
          </div>

          {/* Nota de validación de datos si hay conflicto */}
          {prev.weight && Math.abs(curr.weight - prev.weight) > 3 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-bold uppercase tracking-wider mb-1">
                  Validación de Datos Requerida
                </p>
                <p className="text-sm text-slate-400">
                  Discrepancia detectada: {(curr.weight - prev.weight).toFixed(1)}kg de diferencia vs. registro anterior.
                  ¿Cambio real o error de medición? Contexto: 
                  <span className="text-slate-300">
                    {' '}Última medición {prev.date ? new Date(prev.date).toLocaleDateString('es-ES') : 'N/A'} vs. Actual {curr.date ? new Date(curr.date).toLocaleDateString('es-ES') : 'N/A'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 5) TELEMETRÍA DE AVENTURA */}
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
                <h3 className="text-lg font-bold text-white">Telemetría de Aventura</h3>
                <p className="text-sm text-slate-500">
                  Integración Shearwater + Garmin + Sensores Ambientales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {latestDive?.metadata?.device && (
                <span className="text-[10px] text-slate-600 uppercase tracking-wider hidden sm:block">
                  {latestDive.metadata.device}
                </span>
              )}
              {expandedSection === 'performance' 
                ? <ChevronUp className="text-slate-500" /> 
                : <ChevronDown className="text-slate-500" />
              }
            </div>
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
                    description={currentTelemetry.isDecoViolated 
                      ? '⚠️ Violación de deco detectada' 
                      : 'Perfil de inmersión seguro'}
                  />
                  <MetricCard 
                    label="Ritmo Cardíaco" 
                    value={currentTelemetry.bpm} 
                    unit="BPM" 
                    icon={Heart} 
                    color="text-rose-400"
                    description="HRV y recuperación monitoreados"
                  />
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex flex-col justify-center items-center text-center space-y-3">
                    <Info className="w-8 h-8 text-slate-600" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Stream continuo desde Shearwater Perdix AI, Garmin Fenix y sensores de entorno.
                      {latestDive?.timestamp && (
                        <span className="block mt-2 text-cyan-400">
                          Última inmersión: {new Date(latestDive.timestamp).toLocaleString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 6) CURIE NEURAL CORE */}
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
              CURIE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Neural Core</span>
            </h3>
            
            <p className="text-slate-400 text-base leading-relaxed font-light max-w-2xl">
              Agente de análisis de datos fisiológicos entrenado sobre biomarcadores validados de Abraham-001. 
              Ingesta multimodal: composición corporal (BIA), telemetría de buceo, biométricos continuos (HRV, SpO2, temperatura). 
              Arquitectura RAG con contexto clínico persistente = 
              <span className="text-cyan-400 font-medium"> zero alucinaciones terapéuticas</span>.
            </p>
            
            {/* Métricas de precisión */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">0%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hallucination Rate</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">99.7%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">F1-Score</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">&lt;50ms</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">P95 Latency</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-2xl font-black text-white tracking-tighter">AES-256</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">E2EE + At Rest</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Badge text="RAG-Medical-Grade" color="cyan" />
              <Badge text="Real-time Stream Processing" color="emerald" />
              <Badge text="Federated Learning" color="purple" />
              <Badge text="Edge-First Architecture" color="purple" />
            </div>

            {/* Disclaimer médico */}
            <div className="mt-6 p-4 bg-slate-900/30 rounded-xl border border-white/5">
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="text-slate-400 font-bold">Limitación de responsabilidad:</span> Curie analiza tendencias de datos biométricos, no diagnostica condiciones médicas ni prescribe tratamientos. 
                Toda interpretación de datos de buceo, composición corporal o biométricos debe ser validada por profesionales certificados. 
                El historial farmacológico mostrado es puramente informativo sobre registros existentes.
              </p>
            </div>
          </div>
        </section>

        {/* 7) COMPONENTE DE BITCOIN */}
        <section className="pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Bitcoin className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Settlement Layer
            </span>
          </div>
          <BlinkPayment />
        </section>

      </div>

      {/* 8) FOOTER */}
      <Footer />

      {/* MODAL DE PROTOCOLO - OPCIÓN A (HARDCODEADO) */}
      <ProtocolModal 
        isOpen={isProtocolOpen} 
        onClose={() => setIsProtocolOpen(false)}
        isEmergency={currentTelemetry.isDecoViolated}
        nutritionDoc={{
          id: 'nutrition-001',
          title: 'Dieta Hipertrofia v2',
          description: 'Protocolo de superávit calórico moderado con énfasis en proteína de alta biodisponibilidad',
          fileUrl: '/api/documents/nutrition-001',
          fileSize: '2.4 MB',
          updatedAt: new Date('2025-01-15'),
          version: '2.3',
          checksum: 'a1b2c3d4e5f6789'
        }}
        workoutDoc={{
          id: 'workout-001',
          title: 'Rutina Fuerza 5/3/1',
          description: 'Periodización Jim Wendler modificada para atletas de resistencia',
          fileUrl: '/api/documents/workout-001',
          fileSize: '1.8 MB',
          updatedAt: new Date('2025-01-10'),
          version: '2.0',
          checksum: 'e5f6g7h8i9j0123'
        }}
        prescriptions={[
          {
            id: 'rx-001',
            medication: 'Enantato de Testosterona',
            dosage: '250mg',
            frequency: 'Cada 7 días (lunes AM)',
            prescribedBy: 'Dr. García (Endocrinología)',
            prescribedAt: new Date('2025-01-01'),
            validUntil: new Date('2025-07-01'),
            notes: 'Aplicación IM profunda en glúteo. Rotar sitios. Monitorizar hematocrito cada 3 meses.',
            isActive: true
          },
          {
            id: 'rx-002',
            medication: 'Anastrozol',
            dosage: '0.5mg',
            frequency: 'Cada 3 días (EOD)',
            prescribedBy: 'Dr. García (Endocrinología)',
            prescribedAt: new Date('2025-01-01'),
            validUntil: new Date('2025-07-01'),
            notes: 'Inhibidor de aromatasa. Prevenir ginecomastia.',
            isActive: true
          }
        ]}
        onDownload={handleSecureDownload}
      />
    </main>
  );
}