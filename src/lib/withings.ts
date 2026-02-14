import { encryptToken, decryptToken } from './crypto';

// ============================================================================
// Withings OAuth Configuration
// ============================================================================

const WITHINGS_CLIENT_ID = process.env.WITHINGS_CLIENT_ID!;
const WITHINGS_CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET!;
const WITHINGS_REDIRECT_URI = process.env.WITHINGS_REDIRECT_URI!;

// Withings API endpoints
const WITHINGS_AUTH_URL = 'https://account.withings.com/oauth2_user/authorize2';
const WITHINGS_TOKEN_URL = 'https://wbsapi.withings.net/v2/oauth2';
const WITHINGS_API_BASE = 'https://wbsapi.withings.net/v2';

// Scopes for Withings API
export const WITHINGS_SCOPES = [
  'user.metrics',
  'user.activity',
  'user.sleep',
  'user.sleepevents',
].join(',');

// ============================================================================
// Type Definitions for Withings API
// ============================================================================

export interface WithingsTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  userid?: string;
}

export interface WithingsUser {
  userid: string;
  firstname: string;
  lastname: string;
  gender: number;
  birthdate: number;
  email: string;
}

export interface WithingsMeasurement {
  value: number;
  type: number;
  unit: number;
  date: number;
  created: number;
  deviceid?: string;
  productid?: string;
  comment?: string;
}

export interface WithingsMeasureGroup {
 grpid: number;
 attrib: number;
	date: number;
	created: number;
	productid?: string;
	measures: WithingsMeasurement[];
}

export interface WithingsMeasureResponse {
  status: number;
  body: {
    updatetime?: number;
    timezone?: string;
    measuregrps: WithingsMeasureGroup[];
  };
}

export interface WithingsActivity {
  date: string;
  steps: number;
  distance: number;
  calories: number;
  active_minutes: number;
  total_time_in_bed_seconds?: number;
  total_sleep_time_seconds?: number;
  deep_sleep_time_seconds?: number;
  light_sleep_time_seconds?: number;
  rem_sleep_time_seconds?: number;
  wakeup_count?: number;
  wakeup_duration_seconds?: number;
}

export interface WithingsActivityResponse {
  status: number;
  body: {
    activities: WithingsActivity[];
    more: boolean;
    offset: number;
  };
}

export interface WithingsSleepSummary {
  date: string;
  timezone: string;
  model: number;
  durationtosleep: number;
  durationtowakeup: number;
  total_time_in_bed_seconds: number;
  total_sleep_time_seconds: number;
  deep_sleep_time_seconds: number;
  light_sleep_time_seconds: number;
  rem_sleep_time_seconds: number;
  wakeup_count: number;
  wakeup_duration_seconds: number;
}

export interface WithingsSleepSummaryResponse {
  status: number;
  body: {
    series: WithingsSleepSummary[];
    more: boolean;
    offset: number;
  };
}

// Measurement type mappings
export const WITHINGS_MEASURE_TYPES = {
  1: 'WEIGHT',           // Weight (kg)
  4: 'HEIGHT',           // Height (m)
  5: 'BODY_FAT_PERCENTAGE', // Fat Free Mass (kg)
  6: 'BODY_FAT_PERCENTAGE', // Fat Ratio (%)
  8: 'BONE_MASS',        // Bone Mass (kg)
  9: 'WEIGHT',           // Lean Mass (kg)
  10: 'BMI',             // BMI (kg/m²)
  11: 'MUSCLE_MASS',     // Muscle Mass (kg)
  12: 'BODY_FAT_PERCENTAGE', // Fat Mass Index
  73: 'HEART_RATE',      // Heart Rate (bpm)
  76: 'PULSE_WAVE_VELOCITY', // Pulse Wave Velocity
  88: 'TEMPERATURE',     // Skin Temperature
  91: 'SPO2',            // Blood Oxygen Saturation (%)
  94: 'RESPIRATORY_RATE', // Respiratory Rate
} as const;

// ============================================================================
// OAuth Functions
// ============================================================================

/**
 * Generate Withings OAuth authorization URL
 */
export function getWithingsAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: WITHINGS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: WITHINGS_REDIRECT_URI,
    scope: WITHINGS_SCOPES,
    state,
  });

  return `${WITHINGS_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeWithingsCode(code: string): Promise<WithingsTokens> {
  const response = await fetch(WITHINGS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'requesttoken',
      grant_type: 'authorization_code',
      client_id: WITHINGS_CLIENT_ID,
      client_secret: WITHINGS_CLIENT_SECRET,
      code,
      redirect_uri: WITHINGS_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new WithingsAPIError('Failed to exchange authorization code', error);
  }

  const data = await response.json();

  if (data.status !== 0) {
    throw new WithingsAPIError(`Withings API error: ${data.error}`, data.error);
  }

  return data.body;
}

/**
 * Refresh access token
 */
export async function refreshWithingsToken(refreshToken: string): Promise<WithingsTokens> {
  const response = await fetch(WITHINGS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      action: 'requesttoken',
      grant_type: 'refresh_token',
      client_id: WITHINGS_CLIENT_ID,
      client_secret: WITHINGS_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new WithingsAPIError('Failed to refresh token', error);
  }

  const data = await response.json();

  if (data.status !== 0) {
    throw new WithingsAPIError(`Withings API error: ${data.error}`, data.error);
  }

  return data.body;
}

/**
 * Get Withings user info
 */
export async function getWithingsUser(accessToken: string): Promise<WithingsUser> {
  const response = await fetch(`${WITHINGS_API_BASE}/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new WithingsAPIError('Failed to get user info', error);
  }

  const data = await response.json();

  if (data.status !== 0) {
    throw new WithingsAPIError(`Withings API error: ${data.error}`, data.error);
  }

  return data.body.users[0];
}

// ============================================================================
// Measurement API Functions
// ============================================================================

/**
 * Fetch measurements from Withings API
 */
export async function getWithingsMeasurements(
  accessToken: string,
  startDate?: number,
  endDate?: number,
  dataFields?: string[]
): Promise<WithingsMeasureResponse> {
  const params: Record<string, string> = {
    action: 'getmeas',
  };

  if (startDate) {
    params.startdateymd = startDate.toString();
  }

  if (endDate) {
    params.enddateymd = endDate.toString();
  }

  if (dataFields && dataFields.length > 0) {
    params.data_fields = dataFields.join(',');
  }

  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${WITHINGS_API_BASE}/measure?${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new WithingsAPIError('Failed to fetch measurements', error);
  }

  const data = await response.json();

  if (data.status !== 0) {
    throw new WithingsAPIError(`Withings API error: ${data.error}`, data.error);
  }

  return data;
}

/**
 * Fetch activity data from Withings API
 */
export async function getWithingsActivity(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<WithingsActivityResponse> {
  const params = new URLSearchParams({
    action: 'getactivity',
    startdateymd: startDate,
    enddateymd: endDate,
  });

  const response = await fetch(`${WITHINGS_API_BASE}/measure?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new WithingsAPIError('Failed to fetch activity data', error);
  }

  const data = await response.json();

  if (data.status !== 0) {
    throw new WithingsAPIError(`Withings API error: ${data.error}`, data.error);
  }

  return data;
}

/**
 * Fetch sleep summary from Withings API
 */
export async function getWithingsSleepSummary(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<WithingsSleepSummaryResponse> {
  const params = new URLSearchParams({
    action: 'getsleepsummary',
    startdateymd: startDate,
    enddateymd: endDate,
  });

  const response = await fetch(`${WITHINGS_API_BASE}/sleep?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new WithingsAPIError('Failed to fetch sleep summary', error);
  }

  const data = await response.json();

  if (data.status !== 0) {
    throw new WithingsAPIError(`Withings API error: ${data.error}`, data.error);
  }

  return data;
}

// ============================================================================
// Encrypted Token Management
// ============================================================================

export interface EncryptedWithingsTokens {
  encryptedAccessToken: string;
  encryptedRefreshToken: string;
  expiresAt: Date;
  scope: string;
}

/**
 * Encrypt and store tokens securely
 */
export function encryptWithingsTokens(tokens: WithingsTokens): EncryptedWithingsTokens {
  return {
    encryptedAccessToken: encryptToken(tokens.access_token),
    encryptedRefreshToken: encryptToken(tokens.refresh_token),
    expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    scope: tokens.scope,
  };
}

/**
 * Decrypt tokens for API usage
 */
export function decryptWithingsTokens(
  encryptedTokens: EncryptedWithingsTokens
): { accessToken: string; refreshToken: string } {
  return {
    accessToken: decryptToken(encryptedTokens.encryptedAccessToken),
    refreshToken: decryptToken(encryptedTokens.encryptedRefreshToken),
  };
}

// ============================================================================
// Error Handling
// ============================================================================

export class WithingsAPIError extends Error {
  constructor(
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'WithingsAPIError';
  }
}

/**
 * Handle Withings API errors
 */
export function handleWithingsError(error: unknown): never {
  if (error instanceof WithingsAPIError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new WithingsAPIError('Withings API request failed', error.message);
  }

  throw new WithingsAPIError('Unknown error occurred during Withings API request');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert Withings measurement to standard format
 */
export function convertWithingsMeasurement(
  measurement: WithingsMeasurement
): { type: string; value: number; unit: string } | null {
  const type = WITHINGS_MEASURE_TYPES[measurement.type as keyof typeof WITHINGS_MEASURE_TYPES];
  
  if (!type) {
    console.warn(`Unknown Withings measurement type: ${measurement.type}`);
    return null;
  }

  // Convert units based on type
  let value = measurement.value;
  let unit = '';

  switch (measurement.unit) {
    case -3: // kg
      unit = 'kg';
      break;
    case -2: // g
      value = value / 1000;
      unit = 'kg';
      break;
    case -1: // lbs
      value = value * 0.453592;
      unit = 'kg';
      break;
    case 0: // no unit (count)
      unit = 'count';
      break;
    case 1: // m
      value = value * 100;
      unit = 'cm';
      break;
    case 2: // cm
      unit = 'cm';
      break;
    case 3: // F
      value = (value - 32) * 5 / 9;
      unit = '°C';
      break;
    case 4: // kgs
      unit = 'kg';
      break;
    case 5: // lbs
      value = value * 0.453592;
      unit = 'kg';
      break;
    default:
      unit = '';
  }

  return { type, value, unit };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}
