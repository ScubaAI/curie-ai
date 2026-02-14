/**
 * Patient Dashboard Types
 * TypeScript interfaces for patient dashboard components
 */

export type MeasurementType =
  | 'WEIGHT'
  | 'BODY_FAT_PERCENTAGE'
  | 'MUSCLE_MASS'
  | 'BONE_MASS'
  | 'WATER_PERCENTAGE'
  | 'VISCERAL_FAT'
  | 'BMI'
  | 'BASAL_METABOLIC_RATE'
  | 'HEART_RATE'
  | 'HEART_RATE_VARIABILITY'
  | 'BLOOD_PRESSURE_SYSTOLIC'
  | 'BLOOD_PRESSURE_DIASTOLIC'
  | 'BLOOD_OXYGEN'
  | 'SLEEP_DURATION'
  | 'SLEEP_QUALITY'
  | 'STEPS'
  | 'CALORIES_BURNED'
  | 'ACTIVE_MINUTES'
  | 'VO2MAX'
  | 'RECOVERY_SCORE'
  | 'STRESS_LEVEL';

export type WearableProvider =
  | 'WITHINGS'
  | 'GARMIN'
  | 'APPLE_HEALTH'
  | 'GOOGLE_FIT'
  | 'FITBIT'
  | 'WHOOP'
  | 'OURARING'
  | 'SAMSUNG_HEALTH';

export type WearableStatus = 'connected' | 'syncing' | 'disconnected' | 'error';

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

// ============================================================================
// Measurement Types
// ============================================================================

export interface Measurement {
  id: string;
  type: MeasurementType;
  value: number;
  unit: string;
  source: string | null;
  measuredAt: string;
  isManualEntry: boolean;
}

export interface MeasurementPoint {
  date: string;
  value: number;
  unit: string;
}

export interface AggregatedMeasurement {
  type: MeasurementType;
  avg: number | null;
  max: number | null;
  min: number | null;
  count: number;
}

export interface MeasurementSummary {
  type: MeasurementType;
  label: string;
  value: number;
  unit: string;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
}

// ============================================================================
// Wearable Types
// ============================================================================

export interface WearableDevice {
  id: string;
  provider: WearableProvider;
  deviceName: string | null;
  deviceModel: string | null;
  status: WearableStatus;
  lastSyncAt: string | null;
  lastSuccessfulSync: string | null;
  syncError: string | null;
  isActive: boolean;
  connectedAt: string;
}

// ============================================================================
// Chart Types
// ============================================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartConfig {
  measurementType: MeasurementType;
  label: string;
  color: string;
  unit: string;
}

// ============================================================================
// Dashboard API Response Types
// ============================================================================

export interface MeasurementsResponse {
  success: boolean;
  data: {
    measurements: Measurement[];
    aggregated: AggregatedMeasurement[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface WearablesResponse {
  success: boolean;
  data: WearableDevice[];
}

export interface DashboardSummary {
  latestWeight: MeasurementSummary | null;
  latestBodyFat: MeasurementSummary | null;
  latestMuscleMass: MeasurementSummary | null;
  latestHeartRate: MeasurementSummary | null;
  connectedDevices: number;
  lastSyncAt: string | null;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface PatientDashboardProps {
  patientId: string;
  onSync?: () => void;
  onAddMeasurement?: () => void;
}

export interface MeasurementChartProps {
  measurementType: MeasurementType;
  data: ChartDataPoint[];
  dateRange: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  showLegend?: boolean;
  height?: number;
}

export interface WearableStatusProps {
  devices: WearableDevice[];
  onConnect?: (provider: WearableProvider) => void;
  onDisconnect?: (deviceId: string) => void;
  onSync?: (deviceId: string) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getMeasurementLabel(type: MeasurementType): string {
  const labels: Record<MeasurementType, string> = {
    WEIGHT: 'Peso',
    BODY_FAT_PERCENTAGE: 'Grasa Corporal',
    MUSCLE_MASS: 'Masa Muscular',
    BONE_MASS: 'Masa Ósea',
    WATER_PERCENTAGE: 'Porcentaje de Agua',
    VISCERAL_FAT: 'Grasa Visceral',
    BMI: 'IMC',
    BASAL_METABOLIC_RATE: 'Tasa Metabólica Basal',
    HEART_RATE: 'Frecuencia Cardíaca',
    HEART_RATE_VARIABILITY: 'Variabilidad Cardíaca',
    BLOOD_PRESSURE_SYSTOLIC: 'Presión Arterial Sistólica',
    BLOOD_PRESSURE_DIASTOLIC: 'Presión Arterial Diastólica',
    BLOOD_OXYGEN: 'Oxígeno en Sangre',
    SLEEP_DURATION: 'Duración del Sueño',
    SLEEP_QUALITY: 'Calidad del Sueño',
    STEPS: 'Pasos',
    CALORIES_BURNED: 'Calorías Quemadas',
    ACTIVE_MINUTES: 'Minutos Activos',
    VO2MAX: 'VO2 Max',
    RECOVERY_SCORE: 'Puntuación de Recuperación',
    STRESS_LEVEL: 'Nivel de Estrés',
  };
  return labels[type] || type;
}

export function getMeasurementUnit(type: MeasurementType): string {
  const units: Record<MeasurementType, string> = {
    WEIGHT: 'kg',
    BODY_FAT_PERCENTAGE: '%',
    MUSCLE_MASS: 'kg',
    BONE_MASS: 'kg',
    WATER_PERCENTAGE: '%',
    VISCERAL_FAT: 'rating',
    BMI: 'kg/m²',
    BASAL_METABOLIC_RATE: 'kcal',
    HEART_RATE: 'bpm',
    HEART_RATE_VARIABILITY: 'ms',
    BLOOD_PRESSURE_SYSTOLIC: 'mmHg',
    BLOOD_PRESSURE_DIASTOLIC: 'mmHg',
    BLOOD_OXYGEN: '%',
    SLEEP_DURATION: 'h',
    SLEEP_QUALITY: '%',
    STEPS: 'steps',
    CALORIES_BURNED: 'kcal',
    ACTIVE_MINUTES: 'min',
    VO2MAX: 'mL/kg/min',
    RECOVERY_SCORE: '%',
    STRESS_LEVEL: 'score',
  };
  return units[type] || '';
}

export function getProviderIcon(provider: WearableProvider): string {
  const icons: Record<WearableProvider, string> = {
    WITHINGS: '⚖️',
    GARMIN: '⌚',
    APPLE_HEALTH: '🍎',
    GOOGLE_FIT: '📱',
    FITBIT: '📿',
    WHOOP: '💪',
    OURARING: '💍',
    SAMSUNG_HEALTH: '📱',
  };
  return icons[provider] || '📱';
}

export function getProviderName(provider: WearableProvider): string {
  const names: Record<WearableProvider, string> = {
    WITHINGS: 'Withings',
    GARMIN: 'Garmin',
    APPLE_HEALTH: 'Apple Health',
    GOOGLE_FIT: 'Google Fit',
    FITBIT: 'Fitbit',
    WHOOP: 'Whoop',
    OURARING: 'Oura Ring',
    SAMSUNG_HEALTH: 'Samsung Health',
  };
  return names[provider] || provider;
}

export function getStatusColor(status: WearableStatus): string {
  const colors: Record<WearableStatus, string> = {
    connected: 'bg-emerald-500',
    syncing: 'bg-amber-500',
    disconnected: 'bg-slate-500',
    error: 'bg-red-500',
  };
  return colors[status];
}
