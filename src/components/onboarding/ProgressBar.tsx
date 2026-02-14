"use client";

import React from "react";

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

const defaultLabels = [
  "Demographics",
  "Connect Wearables",
  "Lab Results",
];

export function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels = defaultLabels,
  className = "",
}: ProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar with steps */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full" />

        {/* Filled progress line */}
        <div
          className="absolute top-5 left-0 h-1 bg-teal-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted || isCurrent
                      ? "bg-teal-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  } ${isCurrent ? "ring-4 ring-teal-100 scale-110" : ""}`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step label */}
                <div
                  className={`absolute top-12 w-32 text-center text-sm font-medium transition-colors duration-300 ${
                    isCurrent ? "text-teal-600" : isPending ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {stepLabels[index] || `Step ${index + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step counter */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
}

export default ProgressBar;
