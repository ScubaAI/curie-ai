"use client";

import React, { useState } from "react";

export interface LipidProfileFormData {
  totalCholesterol: number | null;
  ldlCholesterol: number | null;
  hdlCholesterol: number | null;
  triglycerides: number | null;
  vldl: number | null;
  nonHdlCholesterol: number | null;
  cholesterolHdlRatio: number | null;
  labName: string;
  notes: string;
}

interface LipidProfileFormProps {
  onSubmit: (data: LipidProfileFormData) => void;
  initialData?: Partial<LipidProfileFormData>;
  onCancel?: () => void;
}

const initialFormData: LipidProfileFormData = {
  totalCholesterol: null,
  ldlCholesterol: null,
  hdlCholesterol: null,
  triglycerides: null,
  vldl: null,
  nonHdlCholesterol: null,
  cholesterolHdlRatio: null,
  labName: "",
  notes: "",
};

// Reference ranges for lipid profile
const REFERENCE_RANGES = {
  totalCholesterol: { min: 0, max: 200, unit: "mg/dL", normal: "< 200" },
  ldlCholesterol: { min: 0, max: 100, unit: "mg/dL", normal: "< 100" },
  hdlCholesterol: { min: 40, max: 200, unit: "mg/dL", normal: "> 40" },
  triglycerides: { min: 0, max: 150, unit: "mg/dL", normal: "< 150" },
  vldl: { min: 0, max: 30, unit: "mg/dL", normal: "< 30" },
  nonHdlCholesterol: { min: 0, max: 130, unit: "mg/dL", normal: "< 130" },
  cholesterolHdlRatio: { min: 0, max: 5, unit: "ratio", normal: "< 5.0" },
};

export function LipidProfileForm({ onSubmit, initialData, onCancel }: LipidProfileFormProps) {
  const [formData, setFormData] = useState<LipidProfileFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LipidProfileFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredFields: (keyof LipidProfileFormData)[] = [
    "totalCholesterol",
    "ldlCholesterol",
    "hdlCholesterol",
    "triglycerides",
  ];

  const validateField = (name: keyof LipidProfileFormData, value: unknown): string => {
    if (requiredFields.includes(name) && value === "") {
      return "This field is required";
    }
    if (typeof value === "number" && value !== null) {
      if (value < 0) {
        return "Value must be positive";
      }
      const range = REFERENCE_RANGES[name as keyof typeof REFERENCE_RANGES];
      if (range && value > range.max * 2) {
        return `Value seems unusually high (normal: ${range.normal} ${range.unit})`;
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

  const handleNumberChange = (name: keyof LipidProfileFormData, value: string) => {
    const parsedValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LipidProfileFormData, string>> = {};

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
  const referenceClasses = "text-xs text-slate-500 mt-1";

  const renderReferenceBadge = (name: keyof typeof REFERENCE_RANGES) => {
    const range = REFERENCE_RANGES[name];
    return (
      <span className="inline-block px-2 py-1 bg-slate-700/50 rounded text-xs text-cyan-400 ml-2">
        Normal: {range.normal} {range.unit}
      </span>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
        <h3 className="text-sm font-medium text-cyan-400 mb-2">Reference Ranges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
          <span>Total Cholesterol: <200 mg/dL</span>
          <span>LDL: <100 mg/dL</span>
          <span>HDL: >40 mg/dL</span>
          <span>Triglycerides: <150 mg/dL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Cholesterol */}
        <div>
          <label htmlFor="totalCholesterol" className={labelClasses}>
            Total Cholesterol <span className="text-cyan-400">*</span>
            {renderReferenceBadge("totalCholesterol")}
          </label>
          <div className="relative">
            <input
              type="number"
              id="totalCholesterol"
              name="totalCholesterol"
              value={formData.totalCholesterol ?? ""}
              onChange={(e) => handleNumberChange("totalCholesterol", e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className={`${inputClasses} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mg/dL
            </span>
          </div>
          {errors.totalCholesterol && <p className={errorClasses}>{errors.totalCholesterol}</p>}
        </div>

        {/* LDL Cholesterol */}
        <div>
          <label htmlFor="ldlCholesterol" className={labelClasses}>
            LDL Cholesterol <span className="text-cyan-400">*</span>
            {renderReferenceBadge("ldlCholesterol")}
          </label>
          <div className="relative">
            <input
              type="number"
              id="ldlCholesterol"
              name="ldlCholesterol"
              value={formData.ldlCholesterol ?? ""}
              onChange={(e) => handleNumberChange("ldlCholesterol", e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className={`${inputClasses} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mg/dL
            </span>
          </div>
          {errors.ldlCholesterol && <p className={errorClasses}>{errors.ldlCholesterol}</p>}
        </div>

        {/* HDL Cholesterol */}
        <div>
          <label htmlFor="hdlCholesterol" className={labelClasses}>
            HDL Cholesterol <span className="text-cyan-400">*</span>
            {renderReferenceBadge("hdlCholesterol")}
          </label>
          <div className="relative">
            <input
              type="number"
              id="hdlCholesterol"
              name="hdlCholesterol"
              value={formData.hdlCholesterol ?? ""}
              onChange={(e) => handleNumberChange("hdlCholesterol", e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className={`${inputClasses} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mg/dL
            </span>
          </div>
          {errors.hdlCholesterol && <p className={errorClasses}>{errors.hdlCholesterol}</p>}
        </div>

        {/* Triglycerides */}
        <div>
          <label htmlFor="triglycerides" className={labelClasses}>
            Triglycerides <span className="text-cyan-400">*</span>
            {renderReferenceBadge("triglycerides")}
          </label>
          <div className="relative">
            <input
              type="number"
              id="triglycerides"
              name="triglycerides"
              value={formData.triglycerides ?? ""}
              onChange={(e) => handleNumberChange("triglycerides", e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className={`${inputClasses} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mg/dL
            </span>
          </div>
          {errors.triglycerides && <p className={errorClasses}>{errors.triglycerides}</p>}
        </div>

        {/* VLDL (Optional) */}
        <div>
          <label htmlFor="vldl" className={labelClasses}>
            VLDL <span className="text-slate-500">(optional)</span>
            {renderReferenceBadge("vldl")}
          </label>
          <div className="relative">
            <input
              type="number"
              id="vldl"
              name="vldl"
              value={formData.vldl ?? ""}
              onChange={(e) => handleNumberChange("vldl", e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className={`${inputClasses} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mg/dL
            </span>
          </div>
          {errors.vldl && <p className={errorClasses}>{errors.vldl}</p>}
        </div>

        {/* Non-HDL Cholesterol (Optional) */}
        <div>
          <label htmlFor="nonHdlCholesterol" className={labelClasses}>
            Non-HDL Cholesterol <span className="text-slate-500">(optional)</span>
            {renderReferenceBadge("nonHdlCholesterol")}
          </label>
          <div className="relative">
            <input
              type="number"
              id="nonHdlCholesterol"
              name="nonHdlCholesterol"
              value={formData.nonHdlCholesterol ?? ""}
              onChange={(e) => handleNumberChange("nonHdlCholesterol", e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className={`${inputClasses} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              mg/dL
            </span>
          </div>
          {errors.nonHdlCholesterol && <p className={errorClasses}>{errors.nonHdlCholesterol}</p>}
        </div>

        {/* Cholesterol/HDL Ratio (Optional) */}
        <div>
          <label htmlFor="cholesterolHdlRatio" className={labelClasses}>
            Cholesterol/HDL Ratio <span className="text-slate-500">(optional)</span>
            {renderReferenceBadge("cholesterolHdlRatio")}
          </label>
          <div className="relative">
            <input
              type="number"
              id="cholesterolHdlRatio"
              name="cholesterolHdlRatio"
              value={formData.cholesterolHdlRatio ?? ""}
              onChange={(e) => handleNumberChange("cholesterolHdlRatio", e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.1"
              className={`${inputClasses} pr-16`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              ratio
            </span>
          </div>
          {errors.cholesterolHdlRatio && <p className={errorClasses}>{errors.cholesterolHdlRatio}</p>}
        </div>

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
            placeholder="e.g., Quest Diagnostics"
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
          placeholder="Additional observations, fasting status, or clinical notes..."
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
          {isSubmitting ? "Saving..." : "Save Lipid Profile"}
        </button>
      </div>
    </form>
  );
}

export type { LipidProfileFormData };
