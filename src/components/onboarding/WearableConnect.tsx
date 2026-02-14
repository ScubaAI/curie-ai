"use client";

import React, { useState } from "react";
import { WithingsOAuthButton } from "./WithingsOAuthButton";

// Provider types based on Prisma WearableProvider enum
export type WearableProvider =
  | "WITHINGS"
  | "GARMIN"
  | "APPLE_HEALTH"
  | "GOOGLE_FIT"
  | "FITBIT"
  | "WHOOP"
  | "OURARING"
  | "SAMSUNG_HEALTH";

export interface WearableConnectionStatus {
  provider: WearableProvider;
  isConnected: boolean;
  deviceName?: string;
  lastSyncAt?: Date;
  error?: string;
}

export interface WearableInfo {
  id: WearableProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export const WEARABLE_PROVIDERS: WearableInfo[] = [
  {
    id: "WITHINGS",
    name: "Withings",
    description: "Connect your Withings smart scales, blood pressure monitors, and sleep tracker",
    icon: "⚖️",
    color: "#FF6B35",
    features: ["Body composition", "Blood pressure", "Sleep tracking", "Activity"],
  },
  {
    id: "GARMIN",
    name: "Garmin",
    description: "Sync your Garmin watch or fitness tracker for comprehensive activity data",
    icon: "⌚",
    color: "#007CC3",
    features: ["Heart rate", "GPS tracking", "Sleep analysis", "VO2 Max"],
  },
  {
    id: "APPLE_HEALTH",
    name: "Apple Health",
    description: "Import health data from your Apple Watch and iPhone",
    icon: "🍎",
    color: "#555555",
    features: ["Heart health", "Workouts", "Sleep", "Steps"],
  },
  {
    id: "FITBIT",
    name: "Fitbit",
    description: "Connect your Fitbit device to track your daily health metrics",
    icon: "💚",
    color: "#00B0B9",
    features: ["Activity", "Heart rate", "Sleep", "Calories"],
  },
  {
    id: "OURARING",
    name: "Oura Ring",
    description: "Sync your Oura Ring for detailed sleep and recovery insights",
    icon: "💍",
    color: "#D4AF37",
    features: ["Sleep score", "Recovery", "HRV", "Temperature"],
  },
];

export interface WearableConnectProps {
  connectedProviders?: WearableConnectionStatus[];
  onConnect: (provider: WearableProvider) => Promise<void>;
  onDisconnect: (provider: WearableProvider) => Promise<void>;
  className?: string;
}

export function WearableConnect({
  connectedProviders = [],
  onConnect,
  onDisconnect,
  className = "",
}: WearableConnectProps) {
  const [connectingProvider, setConnectingProvider] = useState<WearableProvider | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<WearableProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getConnectionStatus = (provider: WearableProvider): WearableConnectionStatus | undefined => {
    return connectedProviders.find((cp) => cp.provider === provider);
  };

  const handleConnect = async (provider: WearableProvider) => {
    setConnectingProvider(provider);
    setError(null);
    try {
      await onConnect(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: WearableProvider) => {
    setDisconnectingProvider(provider);
    setError(null);
    try {
      await onDisconnect(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setDisconnectingProvider(null);
    }
  };

  const isConnecting = (provider: WearableProvider) => connectingProvider === provider;
  const isDisconnecting = (provider: WearableProvider) => disconnectingProvider === provider;
  const isConnected = (provider: WearableProvider) => getConnectionStatus(provider)?.isConnected;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wearables</h2>
        <p className="text-gray-600">
          Sync your fitness devices to automatically import your health data
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {WEARABLE_PROVIDERS.map((provider) => {
          const connected = isConnected(provider.id);
          const connecting = isConnecting(provider.id);
          const disconnecting = isDisconnecting(provider.id);

          return (
            <div
              key={provider.id}
              className={`p-4 border rounded-xl transition-all duration-200 ${
                connected
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-white hover:border-teal-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${provider.color}20` }}
                  >
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      {provider.name}
                      {connected && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                          Connected
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{provider.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {provider.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {connected && getConnectionStatus(provider.id)?.lastSyncAt && (
                    <span className="text-xs text-gray-500">
                      Last sync:{" "}
                      {new Date(getConnectionStatus(provider)!.lastSyncAt!).toLocaleDateString()}
                    </span>
                  )}

                  {provider.id === "WITHINGS" ? (
                    <WithingsOAuthButton
                      onConnect={() => handleConnect("WITHINGS")}
                      onDisconnect={() => handleDisconnect("WITHINGS")}
                      isConnected={connected}
                      isLoading={connecting || disconnecting}
                    />
                  ) : (
                    <button
                      onClick={() => (connected ? handleDisconnect(provider.id) : handleConnect(provider.id))}
                      disabled={connecting || disconnecting}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        connected
                          ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          : "bg-teal-600 text-white hover:bg-teal-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {connecting || disconnecting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                          {disconnecting ? "Disconnecting..." : "Connecting..."}
                        </span>
                      ) : connected ? (
                        "Disconnect"
                      ) : (
                        "Connect"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">🔒 Your data is secure</p>
        <p>
          We use industry-standard encryption to protect your health data. You can disconnect
          your wearables at any time.
        </p>
      </div>
    </div>
  );
}

export default WearableConnect;
