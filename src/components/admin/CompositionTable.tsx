import { CompositionRecord } from "@prisma/client";

interface CompositionTableProps {
  compositions: CompositionRecord[];
  formatDate: (date: Date | null) => string;
}

export function CompositionTable({
  compositions,
  formatDate,
}: CompositionTableProps) {
  return (
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
            {compositions.map((record, index) => (
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
  );
}
