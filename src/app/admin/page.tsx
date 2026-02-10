"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile: {
    age: number;
    height: number;
    weight: number;
    goal: string;
    injuries: string;
  };
  measurements?: {
    seca?: {
      weight: number;
      smm: number;
      pbf: number;
      bmr: number;
    };
  };
  status: "active" | "completed" | "pending";
  createdAt: string;
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch("/api/patient");
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients || []);
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 animate-pulse">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-black uppercase tracking-widest">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-2xl font-black text-cyan-500 hover:text-cyan-400 transition-colors tracking-tighter">
              Curie
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/admin/measurement" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors">
                Nueva Medición
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Panel de Administración</h1>
            <p className="text-slate-400">Gestiona pacientes y mediciones</p>
          </div>
        </div>

        <div className="grid gap-6">
          {patients.length === 0 ? (
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H0v-2c0-.6567m10 -.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No hay pacientes registrados</h3>
              <p className="text-slate-400 mb-6">Comienza agregando tu primer paciente</p>
              <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors">
                Agregar Paciente
              </button>
            </div>
          ) : (
            patients.map((patient) => (
              <div key={patient.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{patient.name}</h3>
                      <p className="text-slate-400 text-sm">{patient.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    patient.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                    patient.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                    "bg-amber-500/20 text-amber-400"
                  }`}>
                    {patient.status === "active" ? "Activo" : patient.status === "completed" ? "Completado" : "Pendiente"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Edad</p>
                    <p className="text-white font-medium">{patient.profile?.age ?? "-"} años</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Altura</p>
                    <p className="text-white font-medium">{patient.profile?.height ?? "-"} cm</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Peso</p>
                    <p className="text-white font-medium">{patient.profile?.weight ?? "-"} kg</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Objetivo</p>
                    <p className="text-white font-medium truncate">{patient.profile?.goal ?? "-"}</p>
                  </div>
                </div>

                {patient.measurements?.seca && (
                  <div className="mt-4 bg-slate-800/30 rounded-lg p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Última Medición SECA</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-slate-400 text-xs">Peso</p>
                        <p className="text-white font-medium">{patient.measurements.seca.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Masa Muscular</p>
                        <p className="text-white font-medium">{patient.measurements.seca.smm} kg</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">% Grasa</p>
                        <p className="text-white font-medium">{patient.measurements.seca.pbf}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">MB</p>
                        <p className="text-white font-medium">{patient.measurements.seca.bmr} kcal</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <Link href={`/admin/measurement`} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors text-sm">
                    Nueva Medición
                  </Link>
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors text-sm">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
