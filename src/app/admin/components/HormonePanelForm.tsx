"use client";

import React, { useState } from "react";

export interface HormonePanelFormData {
  totalTestosterone: number | null;
  freeTestosterone: number | null;
  shbg: number | null;
  estradiol: number | null;
  lh: number | null;
  fsh: number | null;
  prolactin: number | null;
  cortisol: number | null;
  dheaS: number | null;
  labName: string;
  notes: string;
}

interface HormonePanelFormProps {
  onSubmit: (data: HormonePanelFormData) => void;
  initialData?: Partial<HormonePanelFormData>;
  onCancel?: () => void;
}

const initialFormData: HormonePanelFormData = {
  totalTestosterone: null,
  freeTestosterone: null,
  shbg: null,
  estradiol: null,
  lh: null,
  fsh: null,
  prolactin: null,
  cortisol: null,
  dheaS: null,
  labName: "",
  notes: "",
};

// Reference ranges for male adult hormone panel
const REFERENCE_RANGES = {
  totalTestosterone: { min: 300, max: 1000, unit: "ng/dL", normal: "300-1000" },
  freeTestosterone: { min: 5, max: 21, unit: "pg/mL", normal: "5-21" },
  shbg: { min: 18, max: 54, unit: "nmol/L", normal: "18-54" },
  estradiol: { min: 20, max: 52, unit: "pg/mL", normal: "20-52" },
  lh: { min: 1.7, max: 8.6, unit: "mIU/mL", normal: "1.7-8.6" },
  fsh: { min: 1.5, max: 12.4, unit: "mIU/mL", normal: "1.5-12.4" },
  prolactin: { min: 4, max: 15, unit: "ng/mL", normal: "4-15" },
  cortisol: { min: 6, max: 23, unit: "mcg/dL", normal: "6-23 (AM)" },
  dheaS: { min: 280, max: 640, unit: "mcg/dL", normal: "280-640" },
};

export function HormonePanelForm({ onSubmit, initialData, onCancel }: HormonePanelFormProps) {
  const [formData, setFormData] = useState<HormonePanelFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof HormonePanelFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredFields: (keyof HormonePanelFormData)[] = [
    "totalTestosterone",
    "freeTestosterone",
    "shbg",
    "estradiol",
    "lh",
    "fsh",
    "prolactin",
    "cortisol",
    "dheaS",
  ];

  const validateField = (name: keyof HormonePanelFormData, value: unknown): string => {
    if (requiredFields.includes(name) && value === "") {
      return "This field is required";
    }
    if (typeof value === "number" && value !== null) {
      if (value < 0) {
        return "Value must be positive";
      }
      const range = REFERENCE_RANGES[name as keyof typeof REFERENCE_RANGES];
      if (range && value > range.max * 3) {
        return `Value seems unusually high (normal: ${range.normal} ${range.unit})`;
      }
      if (range && value < range.min / 3 && value > 0) {
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

  const handleNumberChange = (name: keyof HormonePanelFormData, value: string) => {
    const parsedValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HormonePanelFormData, string>> = {};

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
    name: keyof HormonePanelFormData,
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
        <h3 className="text-sm font-medium text-cyan-400 mb-2">Reference Ranges (Male Adult)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
          <span>Total Testosterone: 300-1000 ng/dL</span>
          <span>Free Testosterone: 5-21 pg/mL</span>
          <span>SHBG: 18-54 nmol/L</span>
          <span>Estradiol: 20-52 pg/mL</span>
          <span>LH: 1.7-8.6 mIU/mL</span>
          <span>FSH: 1.5-12.4 mIU/mL</span>
          <span>Prolactin: 4-15 ng/mL</span>
          <span>Cortisol (AM): 6-23 mcg/dL</span>
          <span>DHEA-S: 280-640 mcg/dL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Testosterone */}
        {renderField("totalTestosterone", "Total Testosterone", "ng/dL", "1")}

        {/* Free Testosterone */}
        {renderField("freeTestosterone", "Free Testosterone", "pg/mL", "0.1")}

        {/* SHBG */}
        {renderField("shbg", "SHBG", "nmol/L", "0.1")}

        {/* Estradiol */}
        {renderField("estradiol", "Estradiol", "pg/mL", "0.1")}

        {/* LH */}
        {renderField("lh", "LH", "mIU/mL", "0.1")}

        {/* FSH */}
        {renderField("fsh", "FSH", "mIU/mL", "0.1")}

        {/* Prolactin */}
        {renderField("prolactin", "Prolactin", "ng/mL", "0.1")}

        {/* Cortisol (Morning Sample) */}
        {renderField("cortisol", "Cortisol (morning)", "mcg/dL", "0.1")}

        {/* DHEA-S */}
        {renderField("dheaS", "DHEA-S", "mcg/dL", "1")}

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
          placeholder="Time of sample collection, fasting status, symptoms, or clinical observations..."
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
          {isSubmitting ? "Saving..." : "Save Hormone Panel"}
        </button>
      </div>
    </form>
  );
}

export type { HormonePanelFormData };
