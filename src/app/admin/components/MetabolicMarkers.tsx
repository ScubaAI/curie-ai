"use client";

import React, { useState } from "react";

export interface MetabolicMarkersFormData {
  hba1c: number | null;
  fastingGlucose: number | null;
  insulin: number | null;
  homaIr: number | null;
  cPeptide: number | null;
  uricAcid: number | null;
  vitaminD: number | null;
  tsh: number | null;
  freeT4: number | null;
  labName: string;
  notes: string;
}

interface MetabolicMarkersFormProps {
  onSubmit: (data: MetabolicMarkersFormData) => void;
  initialData?: Partial<MetabolicMarkersFormData>;
  onCancel?: () => void;
}

const initialFormData: MetabolicMarkersFormData = {
  hba1c: null,
  fastingGlucose: null,
  insulin: null,
  homaIr: null,
  cPeptide: null,
  uricAcid: null,
  vitaminD: null,
  tsh: null,
  freeT4: null,
  labName: "",
  notes: "",
};

// Reference ranges for metabolic markers
const REFERENCE_RANGES = {
  hba1c: { min: 4, max: 5.6, unit: "%", normal: "<5.7% normal, 5.7-6.4% prediabetes, ≥6.5% diabetes" },
  fastingGlucose: { min: 70, max: 99, unit: "mg/dL", normal: "70-99" },
  insulin: { min: 2.6, max: 25, unit: "mcU/mL", normal: "2.6-25" },
  homaIr: { min: 0.5, max: 2.5, unit: "", normal: "<2.0 normal, >2.9 insulin resistant" },
  cPeptide: { min: 0.9, max: 2.9, unit: "ng/mL", normal: "0.9-2.9" },
  uricAcid: { min: 3.5, max: 7.2, unit: "mg/dL", normal: "3.5-7.2 (male), 2.6-6.0 (female)" },
  vitaminD: { min: 30, max: 100, unit: "ng/mL", normal: "30-100 (optimal: 40-60)" },
  tsh: { min: 0.4, max: 4.0, unit: "mIU/L", normal: "0.4-4.0" },
  freeT4: { min: 0.8, max: 1.8, unit: "ng/dL", normal: "0.8-1.8" },
};

export function MetabolicMarkersForm({ onSubmit, initialData, onCancel }: MetabolicMarkersFormProps) {
  const [formData, setFormData] = useState<MetabolicMarkersFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MetabolicMarkersFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredFields: (keyof MetabolicMarkersFormData)[] = [
    "hba1c",
    "fastingGlucose",
    "insulin",
    "homaIr",
    "cPeptide",
    "uricAcid",
    "vitaminD",
    "tsh",
    "freeT4",
  ];

  const validateField = (name: keyof MetabolicMarkersFormData, value: unknown): string => {
    if (requiredFields.includes(name) && value === "") {
      return "This field is required";
    }
    if (typeof value === "number" && value !== null) {
      if (value < 0) {
        return "Value must be positive";
      }
      const range = REFERENCE_RANGES[name as keyof typeof REFERENCE_RANGES];
      if (range && range.unit !== "" && value > range.max * 3) {
        return `Value seems unusually high (normal: ${range.normal} ${range.unit})`;
      }
      if (range && range.unit !== "" && value < range.min / 3 && value > 0) {
        return `Value seems unusually low (normal: ${range.normal} ${range.unit})`;
      }
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? (value === "" ? null : parseFloat(value)) : value;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNumberChange = (name: keyof MetabolicMarkersFormData, value: string) => {
    const parsedValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MetabolicMarkersFormData, string>> = {};

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      await onSubmit(formData);
    }

    setIsSubmitting(false);
  };

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200";

  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";
  const errorClasses = "text-red-400 text-sm mt-1";

  const renderReferenceBadge = (name: keyof typeof REFERENCE_RANGES) => {
    const range = REFERENCE_RANGES[name];
    return (
      <span className="inline-block px-2 py-1 bg-slate-700/50 rounded text-xs text-cyan-400 ml-2">
        Normal: {range.normal} {range.unit}
      </span>
    );
  };

  const renderField = (
    name: keyof MetabolicMarkersFormData & keyof typeof REFERENCE_RANGES,
    label: string,
    unit: string,
    step: string = "1",
    placeholder: string = "0"
  ) => (
    <div>
      <label htmlFor={name} className={labelClasses}>
        {label} <span className="text-cyan-400">*</span>
        {renderReferenceBadge(name)}
      </label>
      <div className="relative">
        <input
          type="number"
          id={name}
          name={name}
          value={formData[name] ?? ""}
          onChange={(e) => handleNumberChange(name, e.target.value)}
          placeholder={placeholder}
          min="0"
          step={step}
          className={`${inputClasses} pr-16`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          {unit}
        </span>
      </div>
      {errors[name] && <p className={errorClasses}>{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
        <h3 className="text-sm font-medium text-cyan-400 mb-2">Reference Ranges (Adult)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-400">
          <span>HbA1c: &lt;5.7% normal, 5.7-6.4% pre-diabetes</span>
          <span>Fasting Glucose: 70-99 mg/dL</span>
          <span>Insulin: 2.6-25 mcU/mL</span>
          <span>HOMA-IR: &lt;2.0 normal, &gt;2.9 insulin resistant</span>
          <span>C-Peptide: 0.9-2.9 ng/mL</span>
          <span>Uric Acid: 3.5-7.2 mg/dL (male)</span>
          <span>Vitamin D: 30-100 ng/mL (optimal: 40-60)</span>
          <span>TSH: 0.4-4.0 mIU/L</span>
          <span>Free T4: 0.8-1.8 ng/dL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* HbA1c */}
        {renderField("hba1c", "HbA1c", "%", "0.1")}

        {/* Fasting Glucose */}
        {renderField("fastingGlucose", "Fasting Glucose", "mg/dL", "1")}

        {/* Insulin */}
        {renderField("insulin", "Insulin", "mcU/mL", "0.1")}

        {/* HOMA-IR */}
        {renderField("homaIr", "HOMA-IR", "", "0.01")}

        {/* C-Peptide */}
        {renderField("cPeptide", "C-Peptide", "ng/mL", "0.1")}

        {/* Uric Acid */}
        {renderField("uricAcid", "Uric Acid", "mg/dL", "0.1")}

        {/* Vitamin D */}
        {renderField("vitaminD", "Vitamin D", "ng/mL", "0.1")}

        {/* TSH */}
        {renderField("tsh", "TSH", "mIU/L", "0.01")}

        {/* Free T4 */}
        {renderField("freeT4", "Free T4", "ng/dL", "0.01")}

        {/* Lab Name (Optional) */}
        <div>
          <label htmlFor="labName" className={labelClasses}>
            Lab Name <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            id="labName"
            name="labName"
            value={formData.labName}
            onChange={handleChange}
            placeholder="e.g., Labcorp, Quest Diagnostics"
            className={inputClasses}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClasses}>
          Notes <span className="text-slate-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Fasting status, time of sample collection, medications affecting results, or clinical observations..."
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-cyan-500/20"
        >
          {isSubmitting ? "Saving..." : "Save Metabolic Markers"}
        </button>
      </div>
    </form>
  );
}


