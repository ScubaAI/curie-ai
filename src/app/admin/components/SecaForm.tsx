"use client";

import React, { useState } from "react";

interface SecaFormData {
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
  deviceId: "",
  notes: "",
};

export function SecaForm({ onSubmit, initialData, onCancel }: SecaFormProps) {
  const [formData, setFormData] = useState<SecaFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SecaFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredFields: (keyof SecaFormData)[] = [
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

  const validateField = (name: keyof SecaFormData, value: unknown): string => {
    if (requiredFields.includes(name) && value === "") {
      return "This field is required";
    }
    if (typeof value === "number" && value !== null) {
      if (name === "vfl" && (value < 1 || value > 20)) {
        return "VFL must be between 1 and 20";
      }
      if (name === "phaseAngle" && value < 0) {
        return "Phase Angle must be positive";
      }
      if (value < 0) {
        return "Value must be positive";
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

  const handleNumberChange = (name: keyof SecaFormData, value: string) => {
    const parsedValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SecaFormData, string>> = {};

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weight */}
        <div>
          <label htmlFor="weight" className={labelClasses}>
            Weight <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight ?? ""}
              onChange={(e) => handleNumberChange("weight", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              kg
            </span>
          </div>
          {errors.weight && <p className={errorClasses}>{errors.weight}</p>}
        </div>

        {/* SMM - Skeletal Muscle Mass */}
        <div>
          <label htmlFor="smm" className={labelClasses}>
            SMM - Skeletal Muscle Mass <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="smm"
              name="smm"
              value={formData.smm ?? ""}
              onChange={(e) => handleNumberChange("smm", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              kg
            </span>
          </div>
          {errors.smm && <p className={errorClasses}>{errors.smm}</p>}
        </div>

        {/* PBF - Percent Body Fat */}
        <div>
          <label htmlFor="pbf" className={labelClasses}>
            PBF - Percent Body Fat <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="pbf"
              name="pbf"
              value={formData.pbf ?? ""}
              onChange={(e) => handleNumberChange("pbf", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              max="100"
              className={`${inputClasses} pr-8`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              %
            </span>
          </div>
          {errors.pbf && <p className={errorClasses}>{errors.pbf}</p>}
        </div>

        {/* Body Fat Mass */}
        <div>
          <label htmlFor="bodyFatMass" className={labelClasses}>
            Body Fat Mass <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="bodyFatMass"
              name="bodyFatMass"
              value={formData.bodyFatMass ?? ""}
              onChange={(e) => handleNumberChange("bodyFatMass", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              kg
            </span>
          </div>
          {errors.bodyFatMass && <p className={errorClasses}>{errors.bodyFatMass}</p>}
        </div>

        {/* Total Body Water */}
        <div>
          <label htmlFor="totalBodyWater" className={labelClasses}>
            Total Body Water <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="totalBodyWater"
              name="totalBodyWater"
              value={formData.totalBodyWater ?? ""}
              onChange={(e) => handleNumberChange("totalBodyWater", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              L
            </span>
          </div>
          {errors.totalBodyWater && <p className={errorClasses}>{errors.totalBodyWater}</p>}
        </div>

        {/* Protein */}
        <div>
          <label htmlFor="protein" className={labelClasses}>
            Protein <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="protein"
              name="protein"
              value={formData.protein ?? ""}
              onChange={(e) => handleNumberChange("protein", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              kg
            </span>
          </div>
          {errors.protein && <p className={errorClasses}>{errors.protein}</p>}
        </div>

        {/* Minerals */}
        <div>
          <label htmlFor="minerals" className={labelClasses}>
            Minerals <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="minerals"
              name="minerals"
              value={formData.minerals ?? ""}
              onChange={(e) => handleNumberChange("minerals", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              kg
            </span>
          </div>
          {errors.minerals && <p className={errorClasses}>{errors.minerals}</p>}
        </div>

        {/* BMR */}
        <div>
          <label htmlFor="bmr" className={labelClasses}>
            BMR <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="bmr"
              name="bmr"
              value={formData.bmr ?? ""}
              onChange={(e) => handleNumberChange("bmr", e.target.value)}
              placeholder="0"
              min="0"
              className={`${inputClasses} pr-20`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              kcal/day
            </span>
          </div>
          {errors.bmr && <p className={errorClasses}>{errors.bmr}</p>}
        </div>

        {/* VFL - Visceral Fat Level */}
        <div>
          <label htmlFor="vfl" className={labelClasses}>
            VFL - Visceral Fat Level <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="vfl"
              name="vfl"
              value={formData.vfl ?? ""}
              onChange={(e) => handleNumberChange("vfl", e.target.value)}
              placeholder="1-20"
              min="1"
              max="20"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              1-20
            </span>
          </div>
          {errors.vfl && <p className={errorClasses}>{errors.vfl}</p>}
        </div>

        {/* Phase Angle */}
        <div>
          <label htmlFor="phaseAngle" className={labelClasses}>
            Phase Angle <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="phaseAngle"
              name="phaseAngle"
              value={formData.phaseAngle ?? ""}
              onChange={(e) => handleNumberChange("phaseAngle", e.target.value)}
              placeholder="0.0"
              step="0.1"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              °
            </span>
          </div>
          {errors.phaseAngle && <p className={errorClasses}>{errors.phaseAngle}</p>}
        </div>

        {/* Waist/Hip Ratio (Optional) */}
        <div>
          <label htmlFor="waistHipRatio" className={labelClasses}>
            Waist/Hip Ratio <span className="text-slate-500">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="waistHipRatio"
              name="waistHipRatio"
              value={formData.waistHipRatio ?? ""}
              onChange={(e) => handleNumberChange("waistHipRatio", e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`${inputClasses} pr-12`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              ratio
            </span>
          </div>
        </div>

        {/* Device ID (Optional) */}
        <div>
          <label htmlFor="deviceId" className={labelClasses}>
            Device ID <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            id="deviceId"
            name="deviceId"
            value={formData.deviceId}
            onChange={handleChange}
            placeholder="SECA-XXX-XXXX"
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
          placeholder="Additional observations or notes..."
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
          {isSubmitting ? "Saving..." : "Save Measurements"}
        </button>
      </div>
    </form>
  );
}

export type { SecaFormData };
