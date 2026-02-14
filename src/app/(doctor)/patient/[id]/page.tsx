import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MetricCard from "@/components/MetricCard";
import { PatientHeader } from "@/components/admin/PatientHeader";
import { CompositionTable } from "@/components/admin/CompositionTable";
import { AdvancedMetrics } from "@/components/admin/AdvancedMetrics";
import { EmptyState } from "@/components/admin/EmptyState";
import { AdvisorChat } from "@/components/admin/AdvisorChat";
import DoctorNotes from "@/components/admin/DoctorNotes";
import { Activity, User, TrendingUp, FileText } from "lucide-react";

interface Params {
  params: Promise<{ id: string }>;
}

const formatDate = (date: Date | null): string => {
  if (!date) return "Sin datos";
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

async function getPatient(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      compositions: {
        orderBy: { date: "desc" },
        take: 10,
      },
      doctorNotes: {
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" }
        ],
        take: 50,
      },
      _count: {
        select: {
          compositions: true,
          metrics: true,
          labResults: true,
          doctorNotes: true,
        },
      },
    },
  });
  return patient;
}

export default async function DoctorPatientDetailPage({ params }: Params) {
  const { id } = await params;
  const patient = await getPatient(id);

  if (!patient) {
    notFound();
  }

  // Stats for doctor view (includes notes)
  const stats = [
    { label: "Mediciones", value: patient._count.compositions, icon: Activity },
    { label: "Inmersiones", value: patient._count.metrics, icon: TrendingUp },
    { label: "Análisis", value: patient._count.labResults, icon: FileText },
    { label: "Notas", value: patient._count.doctorNotes, icon: User },
  ];

  const latestComposition = patient.compositions[0] ?? null;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header Stats */}
      <div className="border-b border-emerald-900/30 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md mb-8 -mx-6 px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              Paciente: {patient.name}
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-light">
              ID: {patient.id} • {patient.email}
            </p>
          </div>
          <div className="flex gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Columna izquierda - Contenido del paciente */}
        <div className="lg:col-span-3 space-y-10">
          <PatientHeader
            name={patient.name}
            id={patient.id}
            email={patient.email}
            age={patient.age}
            height={patient.height}
            targetWeight={patient.targetWeight}
          />

          {/* Métricas Corporales */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
              <Activity className="w-6 h-6 text-emerald-400" />
              Métricas Corporales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestComposition && (
                <>
                  <MetricCard
                    label="Peso Actual"
                    value={latestComposition.weight}
                    unit="kg"
                    icon={Activity}
                    description={`Última: ${formatDate(latestComposition.date)}`}
                  />
                  <MetricCard
                    label="Masa Muscular"
                    value={latestComposition.smm}
                    unit="kg"
                    icon={Activity}
                  />
                  <MetricCard
                    label="Grasa Corporal"
                    value={latestComposition.pbf}
                    unit="%"
                    inverseTrend={true}
                    icon={Activity}
                    description={`Masa grasa: ${latestComposition.bodyFatMass?.toFixed(1)} kg`}
                  />
                </>
              )}
            </div>
          </section>

          {latestComposition && <AdvancedMetrics composition={latestComposition} />}

          {/* Historial */}
          <section>
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
              Historial de Compositions
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

          {/* Advisor Chat - Solo para doctores */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
              <Activity className="w-6 h-6 text-purple-400" />
              Asesor de Inmersiones (ArkAngel)
            </h2>
            <AdvisorChat patientId={patient.id} />
          </section>

          {/* Doctor Notes - Solo para doctores */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
              <FileText className="w-6 h-6 text-amber-400" />
              Notas Clínicas
            </h2>
            <DoctorNotes
              patientId={patient.id}
              initialNotes={patient.doctorNotes}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
