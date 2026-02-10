// src/app/admin/components/MetabolicMarkersForm.tsx
"use client";

import React, { useState, useCallback } from "react";

export interface MetabolicMarkersFormData {
  glucose: number | null;
  insulin: number | null;
  hba1c: number | null;
  labName: string;
  notes: string;
}

interface MetabolicMarkersFormProps {
  onSubmit: (data: MetabolicMarkersFormData) => void;
  initialData?: Partial<MetabolicMarkersFormData>;
  onCancel?: () => void;
}

const initialFormData: MetabolicMarkersFormData = {
  glucose: null,
  insulin: null,
  hba1c: null,
  labName: "",
  notes: "",
};

// Rangos de referencia para adultos sanos
const REFERENCE_RANGES = {
  glucose: { min: 70, max: 100, unit: "mg/dL", label: "Glucosa en ayunas", optimal: "70-100" },
  insulin: { min: 2, max: 20, unit: "µIU/mL", label: "Insulina", optimal: "2-20" },
  hba1c: { min: 4, max: 5.7, unit: "%", label: "HbA1c", optimal: "4-5.7" },
} as const;

type FieldKey = keyof typeof REFERENCE_RANGES;

export function MetabolicMarkersForm({ 
  onSubmit, 
  initialData, 
  onCancel 
}: MetabolicMarkersFormProps) {
  const [formData, setFormData] = useState<MetabolicMarkersFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MetabolicMarkersFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof MetabolicMarkersFormData>>(new Set());

  const requiredFields: FieldKey[] = ["glucose", "insulin", "hba1c"];

  const validateField = useCallback((name: keyof MetabolicMarkersFormData, value: unknown): string => {
    if (requiredFields.includes(name as FieldKey) && (value === null || value === "")) {
      return "Requerido";
    }
    if (typeof value !== "number" || value === null) return "";
    if (value < 0) return "Positivo";
    
    const range = REFERENCE_RANGES[name as FieldKey];
    if (!range) return "";
    
    if (value < range.min / 2 || value > range.max * 2) {
      return `Fuera de rango (${range.optimal})`;
    }
    return "";
  }, []);

  const handleChange = (name: keyof MetabolicMarkersFormData, value: string) => {
    const parsed = value === "" ? null : parseFloat(value);
    setFormData((p) => ({ ...p, [name]: parsed }));
    setTouched((p) => new Set(p).add(name));
    setErrors((p) => ({ ...p, [name]: validateField(name, parsed) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MetabolicMarkersFormData, string>> = {};
    let valid = true;
    requiredFields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) { newErrors[f] = err; valid = false; }
    });
    setErrors(newErrors);
    setTouched(new Set(requiredFields));
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  // Calcular HOMA-IR si tenemos ambos valores
  const homaIR = formData.glucose && formData.insulin 
    ? ((formData.glucose * formData.insulin) / 405).toFixed(2)
    : null;

  const inputClass = (field: FieldKey) => {
    const base = "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all";
    const err = errors[field] && touched.has(field);
    return `${base} ${err ? "border-red-500/50 focus:ring-red-500" : "border-slate-700 focus:ring-cyan-500"}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(REFERENCE_RANGES) as FieldKey[]).map((key) => {
          const range = REFERENCE_RANGES[key];
          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">
                  {range.label} <span className="text-cyan-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 uppercase">{range.optimal} {range.unit}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step={key === "hba1c" ? "0.1" : "0.01"}
                  value={formData[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={range.optimal}
                  className={`${inputClass(key)} pr-12`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
                  {range.unit}
                </span>
              </div>
              {errors[key] && touched.has(key) && (
                <p className="text-red-400 text-xs">{errors[key]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* HOMA-IR Calculado */}
      {homaIR && (
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-400">HOMA-IR (Calculado)</p>
            <p className="text-xs text-slate-500">Índice de resistencia a la insulina</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{homaIR}</p>
            <p className={`text-xs ${Number(homaIR) > 2.5 ? "text-amber-400" : "text-emerald-400"}`}>
              {Number(homaIR) > 2.5 ? "Elevado" : "Normal"}
            </p>
          </div>
        </div>
      )}

      {/* Lab y Notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Laboratorio <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            type="text"
            value={formData.labName}
            onChange={(e) => handleChange("labName", e.target.value)}
            placeholder="Ej: Labcorp, Quest"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notas <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Estado del paciente, ayuno, etc."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold shadow-lg shadow-cyan-500/20 transition-all"
        >
          Guardar y Continuar
        </button>
      </div>
    </form>
  );
}

export type { MetabolicMarkersFormData };