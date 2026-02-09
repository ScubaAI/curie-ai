"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SecaForm, SecaFormData } from "../components/SecaForm";
import { LipidProfileForm, LipidProfileFormData } from "../components/LipidProfileForm";
import { HormonePanelForm, HormonePanelFormData } from "../components/HormonePanelForm";
import { MetabolicMarkersForm, MetabolicMarkersFormData } from "../components/MetabolicMarkers";

type TabId = "seca" | "lipid" | "hormone" | "metabolic";

interface MeasurementData {
  seca: Partial<SecaFormData>;
  lipidProfile: Partial<LipidProfileFormData>;
  hormonePanel: Partial<HormonePanelFormData>;
  metabolicMarkers: Partial<MetabolicMarkersFormData>;
}

const tabs: { id: TabId; label: string; description: string }[] = [
  { id: "seca", label: "SECA", description: "Body Composition" },
  { id: "lipid", label: "Perfil Lipídico", description: "Lipid Profile" },
  { id: "hormone", label: "Perfil Hormonal", description: "Hormone Panel" },
  { id: "metabolic", label: "Metabólicos", description: "Metabolic Markers" },
];

const patientId = "abraham-001";

export default function MeasurementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("seca");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [patientData, setPatientData] = useState<{
    name: string | null;
    email: string | null;
    profile: { age: number | null; height: number | null };
  } | null>(null);
  const [measurementData, setMeasurementData] = useState<MeasurementData>({
    seca: {},
    lipidProfile: {},
    hormonePanel: {},
    metabolicMarkers: {},
  });

  useEffect(() => {
    // Fetch patient data
    fetch(`/api/patient/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setPatientData({
            name: data.name,
            email: data.email,
            profile: data.profile,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch patient data:", err);
      });
  }, []);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  const handleSecaSubmit = (data: SecaFormData) => {
    setMeasurementData((prev) => ({ ...prev, seca: data }));
    // Move to next tab automatically for better UX
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleLipidSubmit = (data: LipidProfileFormData) => {
    setMeasurementData((prev) => ({ ...prev, lipidProfile: data }));
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleHormoneSubmit = (data: HormonePanelFormData) => {
    setMeasurementData((prev) => ({ ...prev, hormonePanel: data }));
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleMetabolicSubmit = (data: MetabolicMarkersFormData) => {
    setMeasurementData((prev) => ({ ...prev, metabolicMarkers: data }));
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/patient/${patientId}/measurements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(measurementData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save measurements");
      }

      setSubmitStatus("success");
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error.message || "An error occurred while saving measurements");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "seca":
        return (
          <SecaForm
            onSubmit={handleSecaSubmit}
            initialData={measurementData.seca}
          />
        );
      case "lipid":
        return (
          <LipidProfileForm
            onSubmit={handleLipidSubmit}
            initialData={measurementData.lipidProfile}
          />
        );
      case "hormone":
        return (
          <HormonePanelForm
            onSubmit={handleHormoneSubmit}
            initialData={measurementData.hormonePanel}
          />
        );
      case "metabolic":
        return (
          <MetabolicMarkersForm
            onSubmit={handleMetabolicSubmit}
            initialData={measurementData.metabolicMarkers}
          />
        );
      default:
        return null;
    }
  };

  const completedTabs = {
    seca: Object.keys(measurementData.seca).length > 0,
    lipid: Object.keys(measurementData.lipidProfile).length > 0,
    hormone: Object.keys(measurementData.hormonePanel).length > 0,
    metabolic: Object.keys(measurementData.metabolicMarkers).length > 0,
  };

  const completedCount = Object.values(completedTabs).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Patient Measurements</h1>
              <p className="text-slate-400 mt-1">
                {patientData?.name || "Loading..."} - Complete all measurement tabs
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Progress</p>
                <p className="text-lg font-medium text-cyan-400">
                  {completedCount}/{tabs.length} tabs completed
                </p>
              </div>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(completedCount / tabs.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800/30 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isCompleted = completedTabs[tab.id];
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative flex items-center gap-3 px-6 py-4 rounded-t-lg transition-all duration-200
                    ${isActive
                      ? "bg-slate-700 text-cyan-400 border-t-2 border-cyan-500"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }
                  `}
                >
                  {/* Status Indicator */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted
                        ? "bg-green-500/20 text-green-400"
                        : isActive
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-slate-700 text-slate-500"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      tabs.findIndex((t) => t.id === tab.id) + 1
                    )}
                  </span>

                  <div className="text-left">
                    <p className="font-medium">{tab.label}</p>
                    <p className="text-xs text-slate-500">{tab.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6">
          {renderTabContent()}
        </div>

        {/* Submit Section */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-slate-800/30 rounded-xl border border-slate-700">
          <div className="text-slate-400">
            <p className="text-sm">
              All measurements will be saved to the patient's record.
            </p>
            <p className="text-xs mt-1">
              Patient: {patientData?.name || "Loading..."} ({patientId})
            </p>
          </div>

          <div className="flex items-center gap-4">
            {submitStatus === "error" && (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            )}

            {submitStatus === "success" && (
              <div className="text-green-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Measurements saved successfully! Redirecting...
              </div>
            )}

            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting || completedCount === 0}
              className={`
                px-8 py-3 rounded-lg font-medium transition-all duration-200
                ${
                  isSubmitting || completedCount === 0
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20"
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
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
                `Save All Measurements (${completedCount})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
