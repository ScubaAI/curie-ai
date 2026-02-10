// src/app/admin/measurement/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SecaForm, SecaFormData } from "../components/SecaForm";
import { LipidProfileForm, LipidProfileFormData } from "../components/LipidProfileForm";
import { HormonePanelForm, HormonePanelFormData } from "../components/HormonePanelForm";
import { MetabolicMarkersForm, MetabolicMarkersFormData } from "../components/MetabolicMarkers";

type TabId = "seca" | "lipid" | "hormone" | "metabolic";

type FormDataMap = {
  seca: SecaFormData;
  lipid: LipidProfileFormData;
  hormone: HormonePanelFormData;
  metabolic: MetabolicMarkersFormData;
};

type MeasurementData = {
  [K in TabId]: FormDataMap[K] | null;
};

const TABS: { id: TabId; label: string; description: string; component: React.ComponentType<any> }[] = [
  { id: "seca", label: "SECA", description: "Composición Corporal", component: SecaForm },
  { id: "lipid", label: "Perfil Lipídico", description: "Colesterol y triglicéridos", component: LipidProfileForm },
  { id: "hormone", label: "Perfil Hormonal", description: "Testosterona, LH, FSH, etc.", component: HormonePanelForm },
  { id: "metabolic", label: "Marcadores Metabólicos", description: "Glucosa, insulina, HbA1c", component: MetabolicMarkersForm },
];

const PATIENT_ID = "abraham-001";
const STORAGE_KEY = `curie_measurements_${PATIENT_ID}`;

export default function MeasurementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("seca");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState<{ name: string | null; age: number | null; height: number | null } | null>(null);
  
  const [data, setData] = useState<MeasurementData>({ seca: null, lipid: null, hormone: null, metabolic: null });

  // Cargar datos persistidos y paciente
  useEffect(() => {
    const load = async () => {
      // Cargar del localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved data:", e);
        }
      }

      // Cargar paciente
      try {
        const res = await fetch(`/api/patient/${PATIENT_ID}`);
        if (!res.ok) throw new Error("Patient not found");
        const patient = await res.json();
        setPatientData({
          name: patient.name,
          age: patient.profile?.age ?? null,
          height: patient.profile?.height ?? null,
        });
      } catch (err) {
        console.error("[MEASUREMENT_PAGE]:", err);
        setSubmitStatus("error");
        setErrorMessage("Error cargando paciente. Recargue la página.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Persistir cambios
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoading]);

  const handleSubmit = useCallback(<T extends TabId>(tabId: T) => (formData: FormDataMap[T]) => {
    setData((prev) => ({ ...prev, [tabId]: formData }));
    
    // Avanzar al siguiente tab
    const currentIndex = TABS.findIndex((t) => t.id === tabId);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
  }, []);

  const handleSubmitAll = async () => {
    if (completedCount === 0) return;
    
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch(`/api/patient/${PATIENT_ID}/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          measuredAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error((await res.json()).message || "Error al guardar");

      // Limpiar localStorage al éxito
      localStorage.removeItem(STORAGE_KEY);
      setSubmitStatus("success");
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMessage(err.message || "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAll = () => {
    if (confirm("¿Borrar todas las mediciones? Esta acción no se puede deshacer.")) {
      setData({ seca: null, lipid: null, hormone: null, metabolic: null });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const completedCount = Object.values(data).filter(Boolean).length;
  const progressPercent = (completedCount / TABS.length) * 100;
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400 animate-pulse">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-black uppercase tracking-widest">Inicializando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-2xl font-black text-cyan-500 hover:text-cyan-400 transition-colors tracking-tighter">
                Curie
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors">
                ← Volver
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Mediciones de Paciente</h1>
          <p className="text-slate-400">
            Complete todas las mediciones para el paciente {patientData?.name ?? "Cargando..."}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Progreso: {completedCount} de {TABS.length} mediciones completadas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Form */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          {ActiveComponent && (
            <ActiveComponent
              onSubmit={handleSubmit(activeTab)}
              initialData={data[activeTab] || undefined}
              onCancel={() => router.push("/admin")}
              patientAge={patientData?.age ?? undefined}
              patientHeight={patientData?.height ?? undefined}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={clearAll}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
          >
            Limpiar Todo
          </button>
          <button
            onClick={handleSubmitAll}
            disabled={completedCount === 0 || isSubmitting}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              completedCount === 0 || isSubmitting
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Todas las Mediciones
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ¡Mediciones guardadas exitosamente! Redirigiendo...
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errorMessage}
          </div>
        )}
      </main>
    </div>
  );
}
