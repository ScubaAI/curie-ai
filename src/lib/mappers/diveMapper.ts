import { MetricType } from "@prisma/client";

/**
 * NEXUS DIVE MAPPER
 * Transforma telemetría cruda de Garmin Dive en registros clínicos para Curie.
 */
export const DiveMapper = {
  /**
   * Mapea los datos crudos de Garmin Dive a nuestro modelo MetricLog de Prisma
   */
  mapDiveToMetrics(patientId: string, garminDiveData: any) {
    const metrics = [];
    // Convertimos el timestamp de Garmin (segundos) a objeto Date
    const createdAt = new Date(garminDiveData.startTimeInSeconds * 1000);

    // 1. MÉTRICA DE PROFUNDIDAD (Crítica para presión parcial de nitrógeno)
    if (garminDiveData.maxDepth) {
      metrics.push({
        patientId,
        type: MetricType.DEPTH,
        value: parseFloat(garminDiveData.maxDepth), // Aseguramos float
        unit: "m",
        createdAt,
        metadata: {
          avgDepth: garminDiveData.avgDepth,
          surfaceInterval: garminDiveData.surfaceIntervalDurationInSeconds,
          diveNumber: garminDiveData.diveNumber,
          gasMixture: garminDiveData.gasMixture || "Air",
          source: "Garmin Descent"
        }
      });
    }

    // 2. SEGURIDAD TÉRMICA (Crucial para el gasto metabólico)
    if (garminDiveData.minTemperature) {
      metrics.push({
        patientId,
        type: MetricType.WATER_TEMPERATURE,
        value: parseFloat(garminDiveData.minTemperature),
        unit: "C",
        createdAt,
        metadata: { 
          location: "Underwater",
          protection: "Wetsuit/Drysuit" // Placeholder para que Curie pregunte
        }
      });
    }

    // 3. ALERTAS DE DESCOMPRESIÓN (La "Red Flag" de Curie)
    // Si hubo violación de deco, creamos un registro de alerta
    if (garminDiveData.decompressionViolated) {
      metrics.push({
        patientId,
        type: MetricType.DECO_STOP,
        value: 1.0, // Flag de evento
        unit: "violation",
        createdAt,
        metadata: {
          severity: "CRITICAL",
          message: "Deco Stop Violated - High Risk of DCS",
          recommendedAction: "Oxygen / Medical Observation"
        }
      });
    }

    return metrics;
  }
};
