import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

interface PageProps {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const { patientId } = await searchParams;
  const targetId = patientId || "abraham-001";

  // Fetch patient data with latest composition
  const patient = await prisma.patient.findFirst({
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

  if (!patient) {
    notFound();
  }

  const latestComposition = patient.compositions[0] || null;
  const previousComposition = patient.compositions[1] || null;

  // Calculate changes from previous measurement
  const calculateChange = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null;
    const change = current - previous;
    return {
      value: change,
      isPositive: change > 0,
      isNegative: change < 0,
    };
  };

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

  const formatDate = (date: Date | null) => {
    if (!date) return "Sin datos";
    return new Date(date).toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Patient Info Section */}
        <section className="mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {patient.name || "Paciente"}
                </h1>
                <p className="text-slate-400 text-sm">
                  ID: {patient.id} • {patient.email}
                </p>
                {patient.age && patient.height && (
                  <p className="text-slate-500 text-sm mt-2">
                    {patient.age} años • {patient.height} cm • Meta:{" "}
                    {patient.targetWeight
                      ? `${patient.targetWeight} kg`
                      : "No definida"}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                  Activo
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Métricas Corporales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weight Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">
                  Peso Actual
                </span>
                <svg
                  className="w-5 h-5 text-cyan-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                  {latestComposition?.weight?.toFixed(1) || "--"}
                </span>
                <span className="text-slate-400">kg</span>
              </div>
              {weightChange && (
                <div
                  className={`mt-2 text-sm flex items-center gap-1 ${
                    weightChange.isPositive
                      ? "text-amber-400"
                      : weightChange.isNegative
                      ? "text-green-400"
                      : "text-slate-500"
                  }`}
                >
                  {weightChange.isPositive ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : weightChange.isNegative ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : null}
                  {weightChange.value > 0 ? "+" : ""}
                  {weightChange.value?.toFixed(2)} kg vs anterior
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">
                Última: {formatDate(latestComposition?.date)}
              </p>
            </div>

            {/* SMM Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">
                  Masa Muscular (SMM)
                </span>
                <svg
                  className="w-5 h-5 text-cyan-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                  {latestComposition?.smm?.toFixed(1) || "--"}
                </span>
                <span className="text-slate-400">kg</span>
              </div>
              {smmChange && (
                <div
                  className={`mt-2 text-sm flex items-center gap-1 ${
                    smmChange.isPositive
                      ? "text-green-400"
                      : smmChange.isNegative
                      ? "text-amber-400"
                      : "text-slate-500"
                  }`}
                >
                  {smmChange.isPositive ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : smmChange.isNegative ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : null}
                  {smmChange.value > 0 ? "+" : ""}
                  {smmChange.value?.toFixed(2)} kg vs anterior
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">
                Tipo: {latestComposition?.source || "Manual"}
              </p>
            </div>

            {/* PBF Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">
                  Grasa Corporal (PBF)
                </span>
                <svg
                  className="w-5 h-5 text-cyan-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                  {latestComposition?.pbf?.toFixed(1) || "--"}
                </span>
                <span className="text-slate-400">%</span>
              </div>
              {pbfChange && (
                <div
                  className={`mt-2 text-sm flex items-center gap-1 ${
                    pbfChange.isPositive
                      ? "text-amber-400"
                      : pbfChange.isNegative
                      ? "text-green-400"
                      : "text-slate-500"
                  }`}
                >
                  {pbfChange.isPositive ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : pbfChange.isNegative ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : null}
                  {pbfChange.value > 0 ? "+" : ""}
                  {pbfChange.value?.toFixed(2)}% vs anterior
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3">
                Masa grasa: {latestComposition?.bodyFatMass?.toFixed(1) || "--"} kg
              </p>
            </div>
          </div>
        </section>

        {/* Advanced Metrics */}
        {latestComposition && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              Métricas Avanzadas
            </h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-slate-500 text-sm">Agua Corporal</span>
                  <p className="text-xl font-semibold text-white">
                    {latestComposition.totalBodyWater?.toFixed(1) || "--"} L
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Proteínas</span>
                  <p className="text-xl font-semibold text-white">
                    {latestComposition.protein?.toFixed(1) || "--"} kg
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Minerales</span>
                  <p className="text-xl font-semibold text-white">
                    {latestComposition.minerals?.toFixed(1) || "--"} kg
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Grasa Visceral</span>
                  <p className="text-xl font-semibold text-white">
                    {latestComposition.vfl || "--"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">BMR</span>
                  <p className="text-xl font-semibold text-white">
                    {latestComposition.bmr || "--"} kcal
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Ángulo de Fase</span>
                  <p className="text-xl font-semibold text-white">
                    {latestComposition.phaseAngle?.toFixed(1) || "--"}°
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Cintura/Cadera</span>
                  <p className="text-xl font-semibold text-white">
                    {latestComposition.waistHipRatio?.toFixed(2) || "--"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Nivel</span>
                  <p
                    className={`text-xl font-semibold ${
                      latestComposition.phaseAngle &&
                      latestComposition.phaseAngle >= 6 &&
                      latestComposition.phaseAngle <= 10
                        ? "text-green-400"
                        : "text-amber-400"
                    }`}
                  >
                    {latestComposition.phaseAngle &&
                    latestComposition.phaseAngle >= 6 &&
                    latestComposition.phaseAngle <= 10
                      ? "Óptimo"
                      : "Regular"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Composition History */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            Historial de Composiciones
          </h2>
          {patient.compositions.length > 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-4 px-6 text-slate-400 text-sm font-medium">
                        Fecha
                      </th>
                      <th className="text-right py-4 px-6 text-slate-400 text-sm font-medium">
                        Peso
                      </th>
                      <th className="text-right py-4 px-6 text-slate-400 text-sm font-medium">
                        SMM
                      </th>
                      <th className="text-right py-4 px-6 text-slate-400 text-sm font-medium">
                        PBF
                      </th>
                      <th className="text-right py-4 px-6 text-slate-400 text-sm font-medium">
                        Grasa Visceral
                      </th>
                      <th className="text-left py-4 px-6 text-slate-400 text-sm font-medium">
                        Fuente
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.compositions.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                          index === 0 ? "bg-cyan-500/5" : ""
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                Actual
                              </span>
                            )}
                            <span className="text-white">
                              {formatDate(record.date)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-white tabular-nums">
                          {record.weight.toFixed(1)} kg
                        </td>
                        <td className="py-4 px-6 text-right text-white tabular-nums">
                          {record.smm.toFixed(1)} kg
                        </td>
                        <td className="py-4 px-6 text-right text-white tabular-nums">
                          {record.pbf.toFixed(1)}%
                        </td>
                        <td className="py-4 px-6 text-right text-white tabular-nums">
                          {record.vfl}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {record.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-sm">
              <svg
                className="w-12 h-12 text-slate-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-slate-400 mb-4">
                No hay registros de composición corporal
              </p>
              <Link
                href="/admin/measurement"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
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
                Agregar Primera Medición
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          © 2024 Curie Intelligence. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
