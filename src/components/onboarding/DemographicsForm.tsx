"use client";

import React, { useState } from "react";

// Types based on Prisma schema
export interface DemographicsFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  biologicalSex: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  heightCm: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface DemographicsFormProps {
  initialData?: Partial<DemographicsFormData>;
  onSubmit: (data: DemographicsFormData) => Promise<void>;
  onSkip?: () => void;
  isLoading?: boolean;
}

type FormErrors = Partial<Record<keyof DemographicsFormData, string>>;

export function DemographicsForm({
  initialData,
  onSubmit,
  onSkip,
  isLoading = false,
}: DemographicsFormProps) {
  const [formData, setFormData] = useState<DemographicsFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    biologicalSex: initialData?.biologicalSex || "PREFER_NOT_TO_SAY",
    heightCm: initialData?.heightCm || 0,
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    country: initialData?.country || "GT",
    emergencyContactName: initialData?.emergencyContactName || "",
    emergencyContactPhone: initialData?.emergencyContactPhone || "",
    emergencyContactRelation: initialData?.emergencyContactRelation || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof DemographicsFormData, value: string | number): string => {
    switch (name) {
      case "firstName":
        if (typeof value === "string" && value.trim().length < 2) {
          return "First name must be at least 2 characters";
        }
        break;
      case "lastName":
        if (typeof value === "string" && value.trim().length < 2) {
          return "Last name must be at least 2 characters";
        }
        break;
      case "dateOfBirth":
        if (typeof value === "string") {
          const date = new Date(value);
          const today = new Date();
          if (date >= today) {
            return "Date of birth must be in the past";
          }
          const age = today.getFullYear() - date.getFullYear();
          if (age < 0 || age > 150) {
            return "Please enter a valid date of birth";
          }
        }
        break;
      case "heightCm":
        if (typeof value === "number") {
          if (value < 50 || value > 300) {
            return "Height must be between 50 and 300 cm";
          }
        }
        break;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof DemographicsFormData;
    
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldName === "heightCm" ? (value ? parseFloat(value) : 0) : value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof DemographicsFormData;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof DemographicsFormData>).forEach((key) => {
      const value = formData[key];
      if (value === undefined || value === null || value === "") return;
      const error = validateField(key, value as string | number);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    if (!hasErrors) {
      await onSubmit(formData);
    }
  };

  const getInputClassName = (fieldName: keyof DemographicsFormData) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
    const hasError = touched[fieldName] && errors[fieldName];
    return `${baseClass} ${
      hasError
        ? "border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:ring-teal-200 focus:border-teal-500"
    }`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required Fields Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("firstName")}
              placeholder="Enter your first name"
            />
            {touched.firstName && errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("lastName")}
              placeholder="Enter your last name"
            />
            {touched.lastName && errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("dateOfBirth")}
            />
            {touched.dateOfBirth && errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Biological Sex */}
          <div>
            <label htmlFor="biologicalSex" className="block text-sm font-medium text-gray-700 mb-1">
              Biological Sex <span className="text-red-500">*</span>
            </label>
            <select
              id="biologicalSex"
              name="biologicalSex"
              value={formData.biologicalSex}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("biologicalSex")}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>

          {/* Height */}
          <div>
            <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="heightCm"
              name="heightCm"
              value={formData.heightCm || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("heightCm")}
              placeholder="175"
              min="50"
              max="300"
            />
            {touched.heightCm && errors.heightCm && (
              <p className="mt-1 text-sm text-red-500">{errors.heightCm}</p>
            )}
          </div>
        </div>
      </div>

      {/* Optional Fields Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="+502 1234 5678"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="123 Main Street"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="Guatemala City"
            />
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Department
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="Guatemala"
            />
          </div>

          {/* Zip Code */}
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="01001"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
            >
              <option value="GT">Guatemala</option>
              <option value="MX">Mexico</option>
              <option value="US">United States</option>
              <option value="ES">Spain</option>
              <option value="OT">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="+502 1234 5678"
            />
          </div>

          <div>
            <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <input
              type="text"
              id="emergencyContactRelation"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              placeholder="Spouse, Parent, etc."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Skip for now
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </form>
  );
}

export default DemographicsForm;
