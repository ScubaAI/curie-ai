/*
  Warnings:

  - A unique constraint covering the columns `[withingsUserId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('NUTRITION', 'WORKOUT', 'PRESCRIPTION', 'LAB_RESULT', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DataSource" ADD VALUE 'WITHINGS_B2B';
ALTER TYPE "DataSource" ADD VALUE 'WITHINGS_API';

-- DropIndex
DROP INDEX "BiometricSnapshot_isSynced_idx";

-- DropIndex
DROP INDEX "BiometricSnapshot_patientId_source_idx";

-- DropIndex
DROP INDEX "CompositionRecord_source_idx";

-- DropIndex
DROP INDEX "LabResult_flagged_idx";

-- DropIndex
DROP INDEX "LabResult_patientId_category_idx";

-- DropIndex
DROP INDEX "MetricLog_isProcessed_idx";

-- DropIndex
DROP INDEX "MetricLog_patientId_hasAlert_idx";

-- DropIndex
DROP INDEX "Patient_lastProcessedAt_idx";

-- DropIndex
DROP INDEX "SystemEvent_patientId_isRead_idx";

-- DropIndex
DROP INDEX "SystemEvent_patientId_severity_idx";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "withingsConnectedAt" TIMESTAMP(3),
ADD COLUMN     "withingsExpires" TIMESTAMP(3),
ADD COLUMN     "withingsRefresh" TEXT,
ADD COLUMN     "withingsToken" TEXT,
ADD COLUMN     "withingsUserId" TEXT;

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "prescribedBy" TEXT NOT NULL,
    "prescribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "documentUrl" TEXT,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorSession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "arkangelConvId" TEXT,
    "phaseAngleAtStart" DOUBLE PRECISION,
    "latestCompositionId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "category" TEXT,
    "actionsTaken" TEXT[],

    CONSTRAINT "AdvisorSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "arkangelMsgId" TEXT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvisorMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtocolDocument" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" TEXT,
    "checksum" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "prescribedBy" TEXT,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAccessed" TIMESTAMP(3),

    CONSTRAINT "ProtocolDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAccessLog" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "DocumentAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prescription_patientId_isActive_idx" ON "Prescription"("patientId", "isActive");

-- CreateIndex
CREATE INDEX "AdvisorSession_patientId_startedAt_idx" ON "AdvisorSession"("patientId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "AdvisorSession_arkangelConvId_idx" ON "AdvisorSession"("arkangelConvId");

-- CreateIndex
CREATE INDEX "AdvisorMessage_sessionId_createdAt_idx" ON "AdvisorMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ProtocolDocument_patientId_type_isLatest_idx" ON "ProtocolDocument"("patientId", "type", "isLatest");

-- CreateIndex
CREATE INDEX "DocumentAccessLog_documentId_accessedAt_idx" ON "DocumentAccessLog"("documentId", "accessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_withingsUserId_key" ON "Patient"("withingsUserId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorSession" ADD CONSTRAINT "AdvisorSession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorMessage" ADD CONSTRAINT "AdvisorMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AdvisorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtocolDocument" ADD CONSTRAINT "ProtocolDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccessLog" ADD CONSTRAINT "DocumentAccessLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ProtocolDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccessLog" ADD CONSTRAINT "DocumentAccessLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
