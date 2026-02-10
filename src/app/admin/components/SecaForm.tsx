// src/app/admin/components/SecaForm.tsx
"use client";

import React, { useState, useCallback } from "react";

export interface SecaFormData {
  weight: number | null;
  smm: number | null;
  pbf: number | null;
  bodyFatMass: number | null;
  totalBodyWater: number | null;
  protein: number | null;
  minerals: number | null;
  bmr: number | null;
  vfl: number | null;
  phaseAngle: number | null;
  waistHipRatio: number | null;
  deviceId: string;
  notes: string;
}

interface SecaFormProps {
  onSubmit: (data: SecaFormData) => void;
  initialData?: Partial<SecaFormData>;
  onCancel?: () => void;
  patientAge?: number | null;
  patientHeight?: number | null;
}

const initialFormData: SecaFormData = {
  weight: null,
  smm: null,
  pbf: null,
  bodyFatMass: null,
  totalBodyWater: null,
  protein: null,
  minerals: null,
  bmr: null,
  vfl: null,
  phaseAngle: null,
  waistHipRatio: null,
  deviceId: "SECA-970",
  notes: "",
};

// Rangos de referencia basados en percentiles atléticos
const REFERENCE_RANGES = {
  weight: { min: 40, max: 150, unit: "kg", label: "Peso" },
  smm: { min: 20, max: 60, unit: "kg", label: "Masa Muscular" },
  pbf: { min: 5, max: 35, unit: "%", label: "% Grasa", optimal: "10-20%" },
  bodyFatMass: { min: 3, max: 50, unit: "kg", label: "Masa Grasa" },
  totalBodyWater: { min: 30, max: 70, unit: "L", label: "Agua Total" },
  protein: { min: 8, max: 20, unit: "kg", label: "Proteínas" },
  minerals: { min: 2, max: 5, unit: "kg", label: "Minerales" },
  bmr: { min: 1200, max: 3000, unit: "kcal", label: "Metabolismo Basal" },
  vfl: { min: 1, max: 20, unit: "nivel", label: "Grasa Visceral" },
  phaseAngle: { min: 4, max: 10, unit: "°", label: "Ángulo de Fase", optimal: "6-8°" },
  waistHipRatio: { min: 0.7, max: 1.2, unit: "", label: "Cintura/Cadera" },
} as const;

type NumericField = keyof typeof REFERENCE_RANGES;

export function SecaForm({ 
  onSubmit, 
  initialData, 
  onCancel,
  patientAge,
  patientHeight 
}: SecaFormProps) {
  const [formData, setFormData] = useState<SecaFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SecaFormData, string>>>({});
  const [touched, setTouched] = useState<Set<keyof SecaFormData>>(new Set());

  const requiredFields: NumericField[] = [
    "weight",
    "smm",
    "pbf",
    "bodyFatMass",
    "totalBodyWater",
    "protein",
    "minerals",
    "bmr",
    "vfl",
    "phaseAngle",
  ];

  const validateField = useCallback((name: keyof SecaFormData, value: unknown): string => {
    if (requiredFields.includes(name as NumericField) && (value === null || value === "")) {
      return "Campo requerido";
    }
    
    if (typeof value !== "number" || value === null) return "";
    
    if (value < 0) return "Valor debe ser positivo";
    
    const range = REFERENCE_RANGES[name as NumericField];
    if (!range) return "";

    // Validaciones específicas
    if (name === "vfl" && (value < 1 || value > 20)) {
      return "VFL debe estar entre 1 y 20";
    }
    if (name === "pbf" && (value < 2 || value > 60)) {
      return "PBF fuera de rango (2-60%)";
    }
    if (name === "phaseAngle" && (value < 3 || value > 12)) {
      return "Ángulo de fase fuera de rango (3-12°)";
    }
    
    // Warning si está fuera de rango atlético pero no inválido
    if (value < range.min || value > range.max) {
      return `Valor atípico (rango normal: ${range.min}-${range.max} ${range.unit})`;
    }

    return "";
  }, [requiredFields]);

  const handleChange = (name: keyof SecaFormData, value: string) => {
    const parsedValue = value === "" ? null : parseFloat(value);
    
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setTouched((prev) => new Set(prev).add(name));
    
    // Validación en tiempo real
    const error = validateField(name, parsedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SecaFormData, string>> = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(new Set(requiredFields));
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getFieldStatus = (name: keyof SecaFormData): "default" | "error" | "success" => {
    if (!touched.has(name)) return "default";
    return errors[name] ? "error" : "success";
  };

  const inputClasses = (status: "default" | "error" | "success") => {
    const base = "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200";
    const states = {
      default: "border-slate-700 focus:ring-cyan-500/50 focus:border-cyan-500",
      error: "border-red-500/50 focus:ring-red-500/50 focus:border-red-500",
      success: "border-emerald-500/30 focus:ring-emerald-500/50 focus:border-emerald-500/50",
    };
    return `${base} ${states[status]}`;
  };

  const renderField = (name: NumericField, label: string, step: string = "0.1") => {
    const range = REFERENCE_RANGES[name];
    const status = getFieldStatus(name);
    const value = formData[name];
    const showOptimal = "optimal" in range && range.optimal && value !== null && !errors[name];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor={name} className="text-sm font-medium text-slate-300">
            {label} <span className="text-cyan-400">*</span>
          </label>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            {range.min}-{range.max} {range.unit}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="number"
            id={name}
            name={name}
            value={value ?? ""}
            onChange={(e) => handleChange(name, e.target.value)}
            placeholder={`${range.min}-${range.max}`}
            step={step}
            min={range.min}
            max={name === "vfl" ? 20 : undefined}
            className={`${inputClasses(status)} pr-12`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">
            {range.unit}
          </span>
        </div>

        {errors[name] && touched.has(name) && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors[name]}
          </p>
        )}

        {showOptimal && (
          <p className="text-emerald-400 text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Valor óptimo
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {renderField("weight", "Peso")}
      {renderField("smm", "Masa Muscular", "0.1")}
      {renderField("pbf", "% Grasa", "0.1")}
      {renderField("bodyFatMass", "Masa Grasa", "0.1")}
      {renderField("totalBodyWater", "Agua Total", "0.1")}
      {renderField("protein", "Proteínas", "0.1")}
      {renderField("minerals", "Minerales", "0.1")}
      {renderField("bmr", "Metabolismo Basal", "1")}
      {renderField("vfl", "Grasa Visceral", "0.1")}
      {renderField("phaseAngle", "Ángulo de Fase", "0.1")}
      {renderField("waistHipRatio", "Cintura/Cadera", "0.01")}

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar Medición SECA
        </button>
      </div>
    </form>
  );
}