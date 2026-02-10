import { ChangeResult, ChangeType } from "@/types/metrics";

interface MetricCardProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  change: ChangeResult | null;
  changeType: ChangeType;
  icon: "scale" | "muscle" | "chart";
  lastUpdated?: string;
  source?: string;
  detail?: string;
}

const icons = {
  scale: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
    />
  ),
  muscle: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  ),
  chart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  ),
};

const getTrendColor = (
  direction: "up" | "down" | "stable",
  type: ChangeType
): string => {
  if (direction === "stable") return "text-slate-500";

  const isGood =
    (type === "weight" && direction === "down") ||
    (type === "muscle" && direction === "up") ||
    (type === "fat" && direction === "down");

  return isGood ? "text-green-400" : "text-amber-400";
};

const getTrendIcon = (direction: "up" | "down" | "stable") => {
  if (direction === "stable") return null;

  const path =
    direction === "up"
      ? "M5 10l7-7m0 0l7 7m-7-7v18"
      : "M19 14l-7 7m0 0l-7-7m7 7V3";

  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
};

export function MetricCard({
  label,
  value,
  unit,
  change,
  changeType,
  icon,
  lastUpdated,
  source,
  detail,
}: MetricCardProps) {
  const displayValue = value?.toFixed(1) ?? "--";

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <svg
          className="w-5 h-5 text-cyan-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[icon]}
        </svg>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-white">{displayValue}</span>
        <span className="text-slate-400">{unit}</span>
      </div>

      {change && (
        <div
          className={`mt-2 text-sm flex items-center gap-1 ${getTrendColor(
            change.direction,
            changeType
          )}`}
        >
          {getTrendIcon(change.direction)}
          {change.value > 0 ? "+" : ""}
          {change.value} {unit} vs anterior
        </div>
      )}

      {(lastUpdated || source || detail) && (
        <p className="text-xs text-slate-500 mt-3">
          {detail || `Última: ${lastUpdated}` || `Fuente: ${source}`}
        </p>
      )}
    </div>
  );
}
