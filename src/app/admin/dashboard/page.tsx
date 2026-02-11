import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { PatientHeader } from "@/components/admin/PatientHeader";
import { CompositionTable } from "@/components/admin/CompositionTable";
import { AdvancedMetrics } from "@/components/admin/AdvancedMetrics";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdvisorChat } from "@/components/admin/AdvisorChat";
import { TrendDirection } from "@/types/metrics";
import { Activity, User, TrendingUp } from "lucide-react";

interface ChangeResult {
  value: number;
  direction: TrendDirection;
}

const calculateChange = (
  current: number | null,
  previous: number | null
): ChangeResult | null => {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  return {
    value: Number(diff.toFixed(2)),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
  };
};

const formatDate = (date: Date | null): string => {
  if (!date) return "Sin datos";
  return new Date(date).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default async function DoctorDashboardPage() {
  const patientId = "abraham-001";

  const patient = await prisma.patient.findFirst({
    where: {
      OR: [{ id: patientId }, { email: "abraham@visionaryai.lat" }],
    },
    include: {
      compositions: {
        orderBy: { date: "desc" },
        take: 10,
      },
      _count: {
        select: {
          compositions: true,
          metrics: true,
          labResults: true,
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  const latestComposition = patient.compositions[0] ?? null;
  const previousComposition = patient.compositions[1] ?? null;

  const weightChange = calculateChange(
    latestComposition?.weight ?? null,
    previousComposition?.weight ?? null
  );

  const smmChange = calculateChange(
    latestComposition?.smm ?? null,
    previousComposition?.smm ?? null
  );

  const pbfChange = calculateChange(
    latestComposition?.pbf ?? null,
    previousComposition?.pbf ?? null
  );

  // Stats para el header
  const stats = [
    { label: "Mediciones", value: patient._count.compositions, icon: Activity },
    { label: "Inmersiones", value: patient._count.metrics, icon: TrendingUp },
    { label: "Análisis", value: patient._count.labResults, icon: User },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Stats */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Médico</h1>
              <p className="text-slate-400 text-sm mt-1">
                Vista general del paciente
              </p>
            </div>
            <div className="flex gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-cyan-400">{stat.value}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Datos del paciente */}
          <div className="lg:col-span-2 space-y-8">
            {/* Patient Header */}
            <PatientHeader
              name={patient.name}
              id={patient.id}
              email={patient.email}
              age={patient.age}
              height={patient.height}
              targetWeight={patient.targetWeight}
            />

            {/* Métricas Principales */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Métricas Corporales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  label="Peso Actual"
                  value={latestComposition?.weight}
                  unit="kg"
                  change={weightChange}
                  changeType="weight"
                  icon="scale"
                  lastUpdated={formatDate(latestComposition?.date)}
                />
                <MetricCard
                  label="Masa Muscular (SMM)"
                  value={latestComposition?.smm}
                  unit="kg"
                  change={smmChange}
                  changeType="muscle"
                  icon="muscle"
                  source={latestComposition?.source}
                />
                <MetricCard
                  label="Grasa Corporal (PBF)"
                  value={latestComposition?.pbf}
                  unit="%"
                  change={pbfChange}
                  changeType="fat"
                  icon="chart"
                  detail={`Masa grasa: ${latestComposition?.bodyFatMass?.toFixed(1) ?? "--"} kg`}
                />
              </div>
            </section>

            {/* Métricas Avanzadas */}
            {latestComposition && (
              <AdvancedMetrics composition={latestComposition} />
            )}

            {/* Historial */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">
                Historial de Composiciones
              </h2>
              {patient.compositions.length > 0 ? (
                <CompositionTable
                  compositions={patient.compositions}
                  formatDate={formatDate}
                />
              ) : (
                <EmptyState />
              )}
            </section>
          </div>

          {/* Columna derecha: Advisor Chat */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <AdvisorChat
                patientId={patient.id}
                phaseAngle={latestComposition?.phaseAngle ?? null}
                patientName={patient.name || "Paciente"}
                patientAge={patient.age}
                patientHeight={patient.height}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
