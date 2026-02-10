/**
 * Shared type definitions for Curie AI Patient Dashboard
 * Centralized to prevent duplicate interface conflicts
 */

// Composition data from body composition analysis (e.g., InBody)
export interface CompositionData {
  weight: number;
  smm: number; // Skeletal Muscle Mass
  pbf: number; // Percent Body Fat
  phaseAngle: number;
  totalBodyWater: number;
  vfl: number; // Visceral Fat Level
  bmr: number; // Basal Metabolic Rate
  date?: string; // ISO string format (JSON serialization)
  source?: string;
}

// Dive metrics from Garmin Descent or similar
export interface DiveMetric {
  type: string;
  value: number;
  timestamp?: string; // ISO string format
  metadata?: {
    decompressionViolated?: boolean;
    device?: string;
  };
}

// Biometric data from wearables (heart rate, HRV, etc.)
export interface BiometricData {
  bpm: number;
  timestamp?: string; // ISO string format
  source?: string;
}

// Full patient data aggregate
export interface PatientData {
  id: string;
  name: string;
  email: string;
  compositions: CompositionData[];
  metrics?: DiveMetric[];
  biometrics?: BiometricData[];
  lastChatAt?: string; // ISO string format
  lastProcessedAt?: string; // ISO string format
}

// Computed telemetry from patient data
export interface TelemetryData {
  bpm: number;
  weight: number;
  muscleMass: number;
  pbf: number;
  phaseAngle: number;
  maxDepth: number;
  isDecoViolated: boolean;
  bodyWater: number;
  visceralFat: number;
  bmr: number;
}

// Chat event for alerts and notifications
export interface ChatEvent {
  type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
}
