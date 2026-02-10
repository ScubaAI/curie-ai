// src/app/admin/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { PatientHeader } from "@/components/admin/PatientHeader";
import { CompositionTable } from "@/components/admin/CompositionTable";
import { AdvancedMetrics } from "@/components/admin/AdvancedMetrics";
import { EmptyState } from "@/components/admin/EmptyState";
import { TrendDirection } from "@/types/metrics";

interface PageProps {
  searchParams: Promise<{ patientId?: string }>;
}

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

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const { patientId } = await searchParams;
  const targetId = patientId || "abraham-001";

  let patient;
  
  try {
    patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id: targetId }, { email: "abraham@visionaryai.lat" }],
      },
      include: {
        compositions: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });
  } catch (error) {
    console.error("[ADMIN_DASHBOARD_ERROR]:", error);
    throw new Error("Failed to load patient data");
  }

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-2xl font-bold text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              Curie
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">Panel de Administración</span>
          </div>
          <Link
            href="/admin/measurement"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva Medición
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Patient Info */}
        <PatientHeader
          name={patient.name}
          id={patient.id}
          email={patient.email}
          age={patient.age}
          height={patient.height}
          targetWeight={patient.targetWeight}
        />

        {/* Key Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
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

        {/* Advanced Metrics */}
        {latestComposition && (
          <AdvancedMetrics composition={latestComposition} />
        )}

        {/* History */}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Curie Intelligence. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}