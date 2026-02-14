import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { PatientHeader } from "@/components/admin/PatientHeader";
import { CompositionTable } from "@/components/admin/CompositionTable";
import { AdvancedMetrics } from "@/components/admin/AdvancedMetrics";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdvisorChat } from "@/components/admin/AdvisorChat";
import DoctorNotes from "@/components/admin/DoctorNotes"; // NUEVO
import { RecentEventsWidget } from "../components/RecentEventsWidget";
import { TrendDirection } from "@/types/metrics";
import { Activity, User, TrendingUp, StickyNote, Bell } from "lucide-react"; // Añadido StickyNote

interface ChangeResult {
  value: number;
  direction: TrendDirection;
}

const calculateChange = (
  current: number | null | undefined,
  previous: number | null | undefined
): ChangeResult | null => {
  if (current === null || previous === null || current === undefined || previous === undefined) return null;
  const diff = current - previous;
  return {
    value: Number(diff.toFixed(2)),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
  };
};

const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "Sin datos";
  return new Date(date).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateAge = (dateOfBirth: Date | null | undefined): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default async function DoctorDashboardPage() {
  const patientId = "abraham-001";

  const patientResult = await prisma.patient.findFirst({
    where: {
      OR: [
        { id: patientId },
        { user: { email: "abraham@visionaryai.lat" } }
      ],
    },
    include: {
      user: true,
      compositions: {
        orderBy: { measuredAt: "desc" },
        take: 10,
      },
      doctorNotes: {  // NUEVO: Incluir notas
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" }
        ],
        take: 50,
      },
      _count: {
        select: {
          compositions: true,
          measurements: true,
          labResults: true,
          doctorNotes: true,  // NUEVO
        },
      },
    },
  });

  if (!patientResult) {
    notFound();
  }

  // Type-safe reference
  const patient = patientResult as any;

  const recentEvents = await prisma.systemEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  }) as any[];

  const latestComposition = patient.compositions[0] ?? null;
  const previousComposition = patient.compositions[1] ?? null;

  const weightChange = calculateChange(
    latestComposition?.weight,
    previousComposition?.weight
  );

  const smmChange = calculateChange(
    latestComposition?.muscleMass,
    previousComposition?.muscleMass
  );

  const pbfChange = calculateChange(
    latestComposition?.bodyFatPercentage,
    previousComposition?.bodyFatPercentage
  );

  const stats = [
    { label: "Mediciones", value: patient._count.compositions, icon: Activity },
    { label: "Inmersiones", value: patient._count.measurements, icon: TrendingUp },
    { label: "Análisis", value: patient._count.labResults, icon: User },
    { label: "Notas", value: patient._count.doctorNotes, icon: StickyNote }, // NUEVO
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-slate-950 text-white">
      {/* Header Stats */}
      <div className="border-b border-cyan-900/30 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                Dashboard Médico
              </h1>
              <p className="text-slate-400 mt-1 text-sm font-light">
                Vista general del paciente • Actualizado {formatDate(new Date())}
              </p>
            </div>
            <div className="flex gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-10 lg:space-y-12">
            <PatientHeader
              name={patient.user?.name || `${patient.user?.firstName} ${patient.user?.lastName}`.trim() || "Paciente"}
              id={patient.id}
              email={patient.user?.email || "Sin email"}
              age={calculateAge(patient.dateOfBirth || patient.user?.dateOfBirth)}
              height={patient.heightCm}
              targetWeight={patient.targetWeightKg}
            />

            {/* Métricas Principales */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                <Activity className="w-6 h-6 text-cyan-400" />
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
                  lastUpdated={formatDate(latestComposition?.measuredAt)}
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

            {latestComposition && <AdvancedMetrics composition={latestComposition} />}

            {/* NUEVA SECCIÓN: Notas del Doctor */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                <StickyNote className="w-6 h-6 text-amber-400" />
                Notas Clínicas
              </h2>
              <DoctorNotes
                patientId={patient.id}
                initialNotes={patient.doctorNotes}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
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

          {/* Columna derecha: Chat & Salud */}
          <div className="lg:col-span-1 space-y-8">
            <RecentEventsWidget events={recentEvents} />

            <div className="sticky top-24 h-[calc(100vh-16rem)]">
              <div className="bg-slate-900/40 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl overflow-hidden shadow-2xl h-full">
                <AdvisorChat
                  patientId={patient.id}
                  phaseAngle={latestComposition?.phaseAngle ?? null}
                  patientName={patient.user?.name || patient.user?.firstName || "Paciente"}
                  patientAge={calculateAge(patient.dateOfBirth || patient.user?.dateOfBirth)}
                  patientHeight={patient.heightCm}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}