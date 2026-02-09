-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('DEPTH', 'WATER_TEMPERATURE', 'DECO_STOP', 'DIVE_TIME', 'ASCENT_RATE', 'SURFACE_INTERVAL', 'GAS_MIX', 'HEART_RATE', 'HEART_RATE_VARIABILITY', 'SPO2', 'BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC', 'BLOOD_GLUCOSE', 'KETONES', 'LACTATE', 'POWER_OUTPUT', 'CADENCE', 'SPEED', 'ALTITUDE');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('INBODY_970', 'INBODY_770', 'INBODY_270', 'BIA_MULTIFRECUENCIA', 'BIA_SEGMENTAL', 'BIA_HANDHELD', 'GARMIN_FENIX_7', 'GARMIN_FENIX_7X', 'GARMIN_DESCENT_MK2', 'GARMIN_DESCENT_MK3', 'GARMIN_SCALE', 'APPLE_WATCH_ULTRA', 'APPLE_WATCH_S9', 'WHOOP_4', 'OURA_RING_3', 'SHEARWATER_PERDIX', 'SHEARWATER_PETREL', 'SHEARWATER_TERIC', 'SUUNTO_D5', 'SUUNTO_EON_CORE', 'MANUAL_ENTRY', 'IMPORT_CSV', 'API_INTEGRATION', 'LAB_ANALYSIS');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('CRITICAL', 'WARNING', 'INFO', 'DEBUG');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('DECO_VIOLATION', 'ASCENT_RATE_EXCEEDED', 'LOW_GAS_ALARM', 'DIVE_EMERGENCY', 'HEART_RATE_ANOMALY', 'HRV_LOW', 'SPO2_CRITICAL', 'TEMPERATURE_ANOMALY', 'SIGNIFICANT_WEIGHT_CHANGE', 'MUSCLE_GAIN_DETECTED', 'MUSCLE_LOSS_DETECTED', 'BODY_FAT_THRESHOLD', 'DATA_CONFLICT', 'SYNC_COMPLETED', 'NEW_DATA_AVAILABLE', 'CHAT_SESSION_STARTED');

-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'EVENT');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "age" INTEGER,
    "height" DOUBLE PRECISION,
    "targetWeight" DOUBLE PRECISION,
    "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MODERATELY_ACTIVE',
    "lastChatAt" TIMESTAMP(3),
    "lastProcessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL,
    "smm" DOUBLE PRECISION NOT NULL,
    "pbf" DOUBLE PRECISION NOT NULL,
    "bodyFatMass" DOUBLE PRECISION NOT NULL,
    "totalBodyWater" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "minerals" DOUBLE PRECISION NOT NULL,
    "bmr" INTEGER NOT NULL,
    "vfl" INTEGER NOT NULL,
    "phaseAngle" DOUBLE PRECISION NOT NULL,
    "waistHipRatio" DOUBLE PRECISION,
    "rightArmMuscle" DOUBLE PRECISION,
    "leftArmMuscle" DOUBLE PRECISION,
    "trunkMuscle" DOUBLE PRECISION,
    "rightLegMuscle" DOUBLE PRECISION,
    "leftLegMuscle" DOUBLE PRECISION,
    "source" "DataSource" NOT NULL DEFAULT 'INBODY_270',
    "deviceId" TEXT,
    "isLatest" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "CompositionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricSnapshot" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "bpm" INTEGER,
    "hrv" DOUBLE PRECISION,
    "hrvStatus" TEXT,
    "spo2" DOUBLE PRECISION,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "temperature" DOUBLE PRECISION,
    "skinTemp" DOUBLE PRECISION,
    "steps" INTEGER,
    "calories" INTEGER,
    "activeMinutes" INTEGER,
    "sleepScore" INTEGER,
    "recoveryScore" INTEGER,
    "stressLevel" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "DataSource" NOT NULL,
    "deviceId" TEXT,
    "isSynced" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BiometricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "metadata" JSONB,
    "location" JSONB,
    "source" "DataSource" NOT NULL,
    "deviceId" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "hasAlert" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MetricLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "referenceMin" DOUBLE PRECISION,
    "referenceMax" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "labName" TEXT,
    "notes" TEXT,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "context" JSONB,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "model" TEXT,
    "latencyMs" INTEGER,
    "telemetryContext" JSONB,
    "patientDataContext" JSONB,
    "triggeredEvents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemEvent" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "severity" "EventSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "relatedMetrics" TEXT[],
    "relatedCompositions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientConfig" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "alertOnDecoViolation" BOOLEAN NOT NULL DEFAULT true,
    "alertOnDataConflict" BOOLEAN NOT NULL DEFAULT true,
    "alertThresholdBPM" INTEGER,
    "preferredUnitWeight" TEXT NOT NULL DEFAULT 'kg',
    "preferredUnitHeight" TEXT NOT NULL DEFAULT 'cm',
    "targetSMM" DOUBLE PRECISION,
    "targetPBF" DOUBLE PRECISION,
    "maxDepthAlert" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_lastChatAt_idx" ON "Patient"("lastChatAt");

-- CreateIndex
CREATE INDEX "Patient_lastProcessedAt_idx" ON "Patient"("lastProcessedAt");

-- CreateIndex
CREATE INDEX "CompositionRecord_patientId_isLatest_idx" ON "CompositionRecord"("patientId", "isLatest");

-- CreateIndex
CREATE INDEX "CompositionRecord_patientId_date_idx" ON "CompositionRecord"("patientId", "date" DESC);

-- CreateIndex
CREATE INDEX "CompositionRecord_source_idx" ON "CompositionRecord"("source");

-- CreateIndex
CREATE INDEX "BiometricSnapshot_patientId_recordedAt_idx" ON "BiometricSnapshot"("patientId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "BiometricSnapshot_patientId_source_idx" ON "BiometricSnapshot"("patientId", "source");

-- CreateIndex
CREATE INDEX "BiometricSnapshot_isSynced_idx" ON "BiometricSnapshot"("isSynced");

-- CreateIndex
CREATE INDEX "MetricLog_patientId_type_startedAt_idx" ON "MetricLog"("patientId", "type", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "MetricLog_patientId_hasAlert_idx" ON "MetricLog"("patientId", "hasAlert");

-- CreateIndex
CREATE INDEX "MetricLog_isProcessed_idx" ON "MetricLog"("isProcessed");

-- CreateIndex
CREATE INDEX "LabResult_patientId_date_idx" ON "LabResult"("patientId", "date" DESC);

-- CreateIndex
CREATE INDEX "LabResult_patientId_category_idx" ON "LabResult"("patientId", "category");

-- CreateIndex
CREATE INDEX "LabResult_flagged_idx" ON "LabResult"("flagged");

-- CreateIndex
CREATE INDEX "ChatSession_patientId_startedAt_idx" ON "ChatSession"("patientId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SystemEvent_patientId_createdAt_idx" ON "SystemEvent"("patientId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SystemEvent_patientId_isRead_idx" ON "SystemEvent"("patientId", "isRead");

-- CreateIndex
CREATE INDEX "SystemEvent_patientId_severity_idx" ON "SystemEvent"("patientId", "severity");

-- CreateIndex
CREATE INDEX "SystemEvent_type_isProcessed_idx" ON "SystemEvent"("type", "isProcessed");

-- CreateIndex
CREATE UNIQUE INDEX "PatientConfig_patientId_key" ON "PatientConfig"("patientId");

-- AddForeignKey
ALTER TABLE "CompositionRecord" ADD CONSTRAINT "CompositionRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiometricSnapshot" ADD CONSTRAINT "BiometricSnapshot_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricLog" ADD CONSTRAINT "MetricLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemEvent" ADD CONSTRAINT "SystemEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
