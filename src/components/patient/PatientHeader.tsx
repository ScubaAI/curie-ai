interface PatientHeaderProps {
  name: string | null;
  id: string;
  email: string | null;
  age: number | null;
  height: number | null;
  targetWeight: number | null;
}

export default function PatientHeader({
  name,
  id,
  email,
  age,
  height,
  targetWeight
}: PatientHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-700/40 rounded-3xl p-6 lg:p-10 backdrop-blur-xl shadow-2xl shadow-slate-950/50">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
        {/* Izquierda: Identidad principal – cálida, serena */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none">
              {name || 'Paciente'}
            </h1>
            <span className="text-2xl lg:text-3xl font-light text-slate-400">
              {age && `(${age} años)`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="text-cyan-400 font-medium">ID:</span> {id}
            </span>
            {email && (
              <span className="flex items-center gap-2">
                <span className="text-cyan-400 font-medium">Email:</span> {email}
              </span>
            )}
            {height && (
              <span className="flex items-center gap-2">
                <span className="text-cyan-400 font-medium">Altura:</span> {height} cm
              </span>
            )}
            {targetWeight && (
              <span className="flex items-center gap-2">
                <span className="text-emerald-400 font-medium">Meta:</span> {targetWeight} kg
              </span>
            )}
          </div>
        </div>

        {/* Derecha: Badge de estado – pulso sutil, confianza médica */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          <div className="flex items-center gap-3 px-6 py-3 bg-emerald-950/40 border border-emerald-800/30 rounded-2xl backdrop-blur-sm">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <div className="absolute w-5 h-5 bg-emerald-500/20 rounded-full animate-ping" />
            </div>
            <span className="text-emerald-300 font-semibold text-base">
              Activo • Monitoreo continuo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}