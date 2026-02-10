import Link from "next/link";

interface PatientHeaderProps {
  name: string | null;
  id: string;
  email: string;
  age: number | null;
  height: number | null;
  targetWeight: number | null;
}

export function PatientHeader({
  name,
  id,
  email,
  age,
  height,
  targetWeight,
}: PatientHeaderProps) {
  return (
    <section>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {name || "Paciente"}
            </h1>
            <p className="text-slate-400 text-sm">
              ID: {id} • {email}
            </p>
            {age && height && (
              <p className="text-slate-500 text-sm mt-2">
                {age} años • {height} cm • Meta:{" "}
                {targetWeight ? `${targetWeight} kg` : "No definida"}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse" />
              Activo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
