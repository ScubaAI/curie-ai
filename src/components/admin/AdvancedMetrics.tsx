import { CompositionRecord } from "@prisma/client";

interface AdvancedMetricsProps {
  composition: CompositionRecord;
}

export function AdvancedMetrics({ composition }: AdvancedMetricsProps) {
  const metrics = [
    { label: "Agua Corporal", value: composition.totalBodyWater, unit: "L" },
    { label: "Proteínas", value: composition.protein, unit: "kg" },
    { label: "Minerales", value: composition.minerals, unit: "kg" },
    { label: "Grasa Visceral", value: composition.vfl, unit: "" },
    { label: "BMR", value: composition.bmr, unit: "kcal" },
    { label: "Ángulo de Fase", value: composition.phaseAngle, unit: "°" },
    { label: "Cintura/Cadera", value: composition.waistHipRatio, unit: "" },
  ];

  const phaseAngle = composition.phaseAngle;
  const isOptimal = phaseAngle && phaseAngle >= 6 && phaseAngle <= 10;

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">
        Métricas Avanzadas
      </h2>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map(({ label, value, unit }) => (
            <div key={label}>
              <span className="text-slate-500 text-sm">{label}</span>
              <p className="text-xl font-semibold text-white">
                {value?.toFixed(1) ?? "--"} {unit}
              </p>
            </div>
          ))}
          <div>
            <span className="text-slate-500 text-sm">Nivel</span>
            <p
              className={`text-xl font-semibold ${
                isOptimal ? "text-green-400" : "text-amber-400"
              }`}
            >
              {isOptimal ? "Óptimo" : "Regular"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
