// src/app/(patient)/overview/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Calendar,
  Cpu,
  Shield,
  Watch,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import PatientHeader from '@/components/patient/PatientHeader';
import { CompositionTable } from '@/components/admin/CompositionTable';
import { AdvancedMetrics } from '@/components/admin/AdvancedMetrics';
import { EmptyState } from '@/components/admin/EmptyState';
import PatientChat from '@/components/patient/PatientChat';
import WithingsConnect from '@/components/WithingsConnect';
import WithingsProductCard from '@/components/WithingsProductCard';
import CalScheduling from '@/components/CalScheduling';
import ProtocolModal from '@/components/ProtocolModal';
import MetricCard from '@/components/MetricCard';
import { getRecommendedProducts, ScoredProduct } from '@/lib/shop/getRecommendedProducts';
import { RecommendedProductsTeaser } from '@/components/patient/shop/RecommendedProductsTeaser';

interface DashboardData {
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    height?: number;
    targetWeight?: number;
  };
  compositions: Array<{
    id: string;
    date: string;
    weight: number;
    smm?: number;
    pbf?: number;
    bodyFatMass?: number;
    phaseAngle?: number;
    bmr?: number;
    vfl?: number;
  }>;
  wearableStatus: Array<{
    provider: string;
    deviceModel?: string;
    lastSuccessfulSync?: string;
    syncError?: string;
  }>;
  hasWithings: boolean;
  goals?: string[];
}

const formatDate = (date: string | Date | null): string => {
  if (!date) return 'Sin datos recientes';
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function PatientDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);

  // Recomendaciones con factor sorpresa y ordenamiento diario
  const recommendedProducts = useMemo<ScoredProduct[]>(() => {
    if (!data) return [];
    return getRecommendedProducts({
      age: data.patient.age,
      weight: data.compositions[0]?.weight,
      height: data.patient.height,
      targetWeight: data.patient.targetWeight ?? undefined,
      hasWithings: data.hasWithings,
      goals: data.goals || ['salud general', 'monitoreo'],
      lastCompositionDate: data.compositions[0]?.date
    }, {
      limit: 3,
      includeSurprise: true,
      shuffle: true
    });
  }, [data]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/patient/dashboard');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('No pudimos cargar tu dashboard');
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || 'Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const protocolData = {
    nutritionDoc: {
      id: 'nutrition-001',
      title: 'Protocolo Nutricional',
      description: 'Configuración macro-nutricional personalizada',
      fileUrl: '#',
      fileSize: '1.2 MB',
      updatedAt: new Date(),
      version: '2.1',
      checksum: 'sha256-abc'
    },
    workoutDoc: {
      id: 'workout-001',
      title: 'Rutina de Entrenamiento',
      description: 'Hipertrofia y fuerza adaptada a tu composición',
      fileUrl: '#',
      fileSize: '0.8 MB',
      updatedAt: new Date(),
      version: '1.5',
      checksum: 'sha256-def'
    },
    prescriptions: [],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-14 h-14 text-cyan-500 animate-spin mx-auto" />
          <p className="text-slate-300 text-lg">Preparando tu visión completa de salud...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500/70 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Algo salió mal</h2>
          <p className="text-slate-300 mb-8">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-950/40"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { patient, compositions, hasWithings } = data;
  const latest = compositions[0] ?? null;
  const previous = compositions[1] ?? null;

  const weightChange = latest && previous ? latest.weight - previous.weight : 0;
  const smmChange = latest && previous ? (latest.smm || 0) - (previous.smm || 0) : 0;
  const pbfChange = latest && previous ? (latest.pbf || 0) - (previous.pbf || 0) : 0;

  return (
    <>
      <ProtocolModal
        isOpen={isProtocolOpen}
        onClose={() => setIsProtocolOpen(false)}
        nutritionDoc={protocolData.nutritionDoc}
        workoutDoc={protocolData.workoutDoc}
        prescriptions={protocolData.prescriptions}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        <div className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
          {/* Header – identidad paciente */}
          <PatientHeader
            name={`${patient.firstName} ${patient.lastName}`}
            id="patient-id"
            email={patient.email}
            age={patient.age || 25}
            height={patient.height || 178}
            targetWeight={patient.targetWeight ?? null}
          />

          {/* Progreso reciente – tarjetas con glow sutil */}
          {latest && (
            <section className="space-y-8">
              <h2 className="text-3xl font-bold flex items-center gap-4">
                <Activity className="w-8 h-8 text-cyan-500" />
                Tu progreso reciente
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  label="Peso actual"
                  value={latest.weight}
                  unit="kg"
                  trend={
                    weightChange !== 0
                      ? { value: Math.abs(weightChange), isUp: weightChange < 0 }
                      : undefined
                  }
                  description={`Medido el ${formatDate(latest.date)}`}
                  color="cyan"
                />

                <MetricCard
                  label="Masa muscular (SMM)"
                  value={latest.smm ?? '—'}
                  unit="kg"
                  trend={
                    smmChange !== 0
                      ? { value: Math.abs(smmChange), isUp: smmChange > 0 }
                      : undefined
                  }
                  color="emerald"
                />

                <MetricCard
                  label="% Grasa corporal (PBF)"
                  value={latest.pbf ?? '—'}
                  unit="%"
                  trend={
                    pbfChange !== 0
                      ? { value: Math.abs(pbfChange), isUp: pbfChange < 0, inverseTrend: true }
                      : undefined
                  }
                  description={`Masa grasa: ${latest.bodyFatMass?.toFixed(1) ?? '—'} kg`}
                  color="rose"
                />
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950/40">
                <AdvancedMetrics
                  composition={{
                    weight: latest.weight,
                    bodyFatPercentage: latest.pbf ?? null,
                    muscleMass: latest.smm ?? null,
                    visceralFatRating: latest.vfl ?? null,
                    phaseAngle: latest.phaseAngle ?? null,
                    bmr: latest.bmr ?? null,
                  } as any}
                />
              </div>
            </section>
          )}

          {/* Historial completo */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold">Historial de composición corporal</h2>
            {compositions.length > 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-950/30">
                <CompositionTable
                  compositions={compositions.map((c) => ({
                    ...c,
                    date: new Date(c.date || Date.now()),
                  })) as any}
                  formatDate={formatDate}
                />
              </div>
            ) : (
              <EmptyState />
            )}
          </section>

          {/* Chat con Curie – el alma conversacional */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold flex items-center gap-4">
              <Cpu className="w-8 h-8 text-cyan-500" />
              Habla con Curie
            </h2>
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/20">
              <PatientChat
                patientId="patient-id"
                hasWithings={hasWithings}
                compositions={compositions}
                patientData={{
                  id: 'patient-id',
                  name: patient.firstName,
                  age: patient.age || 25,
                  height: patient.height || 178,
                  targetWeight: patient.targetWeight ?? null,
                }}
              />
            </div>
          </section>

          {/* Acciones rápidas – grid equilibrado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-4">
                <Calendar className="w-7 h-7 text-emerald-500" />
                Agendar tu próxima consulta
              </h2>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-emerald-950/20">
                <CalScheduling
                  calUsername="tu-usuario-cal"
                  eventType="consulta-medica"
                />
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-4">
                <Shield className="w-7 h-7 text-emerald-500" />
                Tu protocolo actual
              </h2>
              <button
                onClick={() => setIsProtocolOpen(true)}
                className="w-full h-20 flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-cyan-600 hover:from-emerald-600 hover:via-emerald-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-emerald-950/40 hover:shadow-emerald-900/60"
              >
                <FileText className="w-7 h-7" />
                Ver mi protocolo completo
              </button>
            </section>
          </div>

          {/* Dispositivos y Tienda Curie */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-4">
              <Watch className="w-7 h-7 text-cyan-500" />
              Mis dispositivos conectados
            </h2>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950/30">
              {hasWithings ? (
                <WithingsConnect patientId="patient-id" isConnected={true} />
              ) : (
                <div className="space-y-8">
                  <WithingsConnect patientId="patient-id" isConnected={false} />
                  <WithingsProductCard clipPaymentUrl="https://pay.clip.mx/tu-link-aqui" />
                </div>
              )}
            </div>

            {/* Tienda Curie - Recomendaciones inteligentes */}
            <RecommendedProductsTeaser
              products={recommendedProducts}
              isLoading={false} // Ya tenemos los datos, no necesitamos loading aquí
              patientName={patient.firstName}
            />
          </section>

          {/* Footer minimal */}
          <footer className="pt-16 border-t border-slate-800 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Curie • Cuidado médico con datos reales</p>
          </footer>
        </div>
      </div>
    </>
  );
}