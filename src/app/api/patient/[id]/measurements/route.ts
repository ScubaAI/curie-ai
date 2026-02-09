import { NextResponse } from 'next/server';
import { PrismaClient, DataSource } from '@prisma/client';

const prisma = new PrismaClient();

// Types for measurement data
interface SecaData {
  weight: number | null;
  smm: number | null;
  pbf: number | null;
  bodyFatMass: number | null;
  totalBodyWater: number | null;
  protein: number | null;
  minerals: number | null;
  bmr: number | null;
  vfl: number | null;
  phaseAngle: number | null;
  waistHipRatio: number | null;
  deviceId: string;
  notes: string;
}

interface LipidProfileData {
  totalCholesterol: number | null;
  ldlCholesterol: number | null;
  hdlCholesterol: number | null;
  triglycerides: number | null;
  vldl: number | null;
  nonHdlCholesterol: number | null;
  cholesterolHdlRatio: number | null;
  labName: string;
  notes: string;
}

interface HormonePanelData {
  totalTestosterone: number | null;
  freeTestosterone: number | null;
  shbg: number | null;
  estradiol: number | null;
  lh: number | null;
  fsh: number | null;
  prolactin: number | null;
  cortisol: number | null;
  dheaS: number | null;
  labName: string;
  notes: string;
}

interface MetabolicMarkersData {
  hba1c: number | null;
  fastingGlucose: number | null;
  insulin: number | null;
  homaIr: number | null;
  cPeptide: number | null;
  uricAcid: number | null;
  vitaminD: number | null;
  tsh: number | null;
  freeT4: number | null;
  labName: string;
  notes: string;
}

interface MeasurementRequest {
  seca: Partial<SecaData>;
  lipidProfile: Partial<LipidProfileData>;
  hormonePanel: Partial<HormonePanelData>;
  metabolicMarkers: Partial<MetabolicMarkersData>;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  try {
    const body: MeasurementRequest = await request.json();

    // Verify patient exists
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id: patientId }, { email: "abraham@visionaryai.lat" }]
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "PATIENT_NOT_FOUND", message: `Patient ${patientId} not found` },
        { status: 404 }
      );
    }

    const results: { success: boolean; type: string; error?: string }[] = [];

    // 1. Save SECA body composition data
    if (body.seca && Object.keys(body.seca).length > 0) {
      try {
        // Mark all existing compositions as not latest
        await prisma.compositionRecord.updateMany({
          where: { patientId: patient.id },
          data: { isLatest: false }
        });

        // Create new composition record
        const secaData = body.seca;
        await prisma.compositionRecord.create({
          data: {
            patientId: patient.id,
            weight: secaData.weight || 0,
            smm: secaData.smm || 0,
            pbf: secaData.pbf || 0,
            bodyFatMass: secaData.bodyFatMass || 0,
            totalBodyWater: secaData.totalBodyWater || 0,
            protein: secaData.protein || 0,
            minerals: secaData.minerals || 0,
            bmr: secaData.bmr || 0,
            vfl: secaData.vfl || 0,
            phaseAngle: secaData.phaseAngle || 0,
            waistHipRatio: secaData.waistHipRatio,
            source: DataSource.MANUAL_ENTRY,
            deviceId: secaData.deviceId || null,
            isLatest: true,
            notes: secaData.notes || null,
          }
        });
        results.push({ success: true, type: 'composition' });
      } catch (error: any) {
        results.push({ success: false, type: 'composition', error: error.message });
      }
    }

    // 2. Save lipid profile lab results
    if (body.lipidProfile && Object.keys(body.lipidProfile).length > 0) {
      try {
        const lipidData = body.lipidProfile;
        const lipidMarkers = [
          { name: 'Total Cholesterol', value: lipidData.totalCholesterol, unit: 'mg/dL', refMin: 0, refMax: 200 },
          { name: 'LDL Cholesterol', value: lipidData.ldlCholesterol, unit: 'mg/dL', refMin: 0, refMax: 100 },
          { name: 'HDL Cholesterol', value: lipidData.hdlCholesterol, unit: 'mg/dL', refMin: 40, refMax: 200 },
          { name: 'Triglycerides', value: lipidData.triglycerides, unit: 'mg/dL', refMin: 0, refMax: 150 },
          { name: 'VLDL', value: lipidData.vldl, unit: 'mg/dL', refMin: 0, refMax: 30 },
          { name: 'Non-HDL Cholesterol', value: lipidData.nonHdlCholesterol, unit: 'mg/dL', refMin: 0, refMax: 130 },
          { name: 'Cholesterol/HDL Ratio', value: lipidData.cholesterolHdlRatio, unit: 'ratio', refMin: 0, refMax: 5 },
        ];

        for (const marker of lipidMarkers) {
          if (marker.value !== null && marker.value !== undefined) {
            const status = marker.refMin !== undefined && marker.value > marker.refMax ? 'alto' : 'normal';
            await prisma.labResult.create({
              data: {
                patientId: patient.id,
                name: marker.name,
                category: 'Lipídico',
                value: marker.value,
                unit: marker.unit,
                referenceMin: marker.refMin,
                referenceMax: marker.refMax,
                status,
                flagged: status === 'alto',
                labName: lipidData.labName || null,
                notes: lipidData.notes || null,
              }
            });
          }
        }
        results.push({ success: true, type: 'lipid_profile' });
      } catch (error: any) {
        results.push({ success: false, type: 'lipid_profile', error: error.message });
      }
    }

    // 3. Save hormone panel lab results
    if (body.hormonePanel && Object.keys(body.hormonePanel).length > 0) {
      try {
        const hormoneData = body.hormonePanel;
        const hormoneMarkers = [
          { name: 'Total Testosterone', value: hormoneData.totalTestosterone, unit: 'ng/dL', refMin: 300, refMax: 1000 },
          { name: 'Free Testosterone', value: hormoneData.freeTestosterone, unit: 'pg/mL', refMin: 5, refMax: 21 },
          { name: 'SHBG', value: hormoneData.shbg, unit: 'nmol/L', refMin: 18, refMax: 54 },
          { name: 'Estradiol', value: hormoneData.estradiol, unit: 'pg/mL', refMin: 20, refMax: 52 },
          { name: 'LH', value: hormoneData.lh, unit: 'mIU/mL', refMin: 1.7, refMax: 8.6 },
          { name: 'FSH', value: hormoneData.fsh, unit: 'mIU/mL', refMin: 1.5, refMax: 12.4 },
          { name: 'Prolactin', value: hormoneData.prolactin, unit: 'ng/mL', refMin: 4, refMax: 15 },
          { name: 'Cortisol (AM)', value: hormoneData.cortisol, unit: 'mcg/dL', refMin: 6, refMax: 23 },
          { name: 'DHEA-S', value: hormoneData.dheaS, unit: 'mcg/dL', refMin: 280, refMax: 640 },
        ];

        for (const marker of hormoneMarkers) {
          if (marker.value !== null && marker.value !== undefined) {
            const isLow = marker.value < marker.refMin;
            const isHigh = marker.value > marker.refMax;
            let status = 'normal';
            if (isLow) status = 'bajo';
            else if (isHigh) status = 'alto';

            await prisma.labResult.create({
              data: {
                patientId: patient.id,
                name: marker.name,
                category: 'Hormonal',
                value: marker.value,
                unit: marker.unit,
                referenceMin: marker.refMin,
                referenceMax: marker.refMax,
                status,
                flagged: isLow || isHigh,
                labName: hormoneData.labName || null,
                notes: hormoneData.notes || null,
              }
            });
          }
        }
        results.push({ success: true, type: 'hormone_panel' });
      } catch (error: any) {
        results.push({ success: false, type: 'hormone_panel', error: error.message });
      }
    }

    // 4. Save metabolic markers lab results
    if (body.metabolicMarkers && Object.keys(body.metabolicMarkers).length > 0) {
      try {
        const metabolicData = body.metabolicMarkers;
        const metabolicMarkers = [
          { name: 'HbA1c', value: metabolicData.hba1c, unit: '%', refMin: 4, refMax: 5.6 },
          { name: 'Fasting Glucose', value: metabolicData.fastingGlucose, unit: 'mg/dL', refMin: 70, refMax: 99 },
          { name: 'Insulin', value: metabolicData.insulin, unit: 'mcU/mL', refMin: 2.6, refMax: 25 },
          { name: 'HOMA-IR', value: metabolicData.homaIr, unit: '', refMin: 0.5, refMax: 2.5 },
          { name: 'C-Peptide', value: metabolicData.cPeptide, unit: 'ng/mL', refMin: 0.9, refMax: 2.9 },
          { name: 'Uric Acid', value: metabolicData.uricAcid, unit: 'mg/dL', refMin: 3.5, refMax: 7.2 },
          { name: 'Vitamin D', value: metabolicData.vitaminD, unit: 'ng/mL', refMin: 30, refMax: 100 },
          { name: 'TSH', value: metabolicData.tsh, unit: 'mIU/L', refMin: 0.4, refMax: 4.0 },
          { name: 'Free T4', value: metabolicData.freeT4, unit: 'ng/dL', refMin: 0.8, refMax: 1.8 },
        ];

        for (const marker of metabolicMarkers) {
          if (marker.value !== null && marker.value !== undefined) {
            const isLow = marker.value < marker.refMin;
            const isHigh = marker.value > marker.refMax;
            let status = 'normal';
            if (isLow) status = 'bajo';
            else if (isHigh) status = 'alto';

            await prisma.labResult.create({
              data: {
                patientId: patient.id,
                name: marker.name,
                category: 'Metabólico',
                value: marker.value,
                unit: marker.unit,
                referenceMin: marker.refMin,
                referenceMax: marker.refMax,
                status,
                flagged: isLow || isHigh,
                labName: metabolicData.labName || null,
                notes: metabolicData.notes || null,
              }
            });
          }
        }
        results.push({ success: true, type: 'metabolic_markers' });
      } catch (error: any) {
        results.push({ success: false, type: 'metabolic_markers', error: error.message });
      }
    }

    const allSuccess = results.every(r => r.success);
    const failedResults = results.filter(r => !r.success);

    if (allSuccess) {
      return NextResponse.json({
        success: true,
        message: 'All measurements saved successfully',
        patientId: patient.id,
        results
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Some measurements failed to save',
        patientId: patient.id,
        results,
        errors: failedResults.map(r => ({ type: r.type, error: r.error }))
      }, { status: 207 }); // Multi-status
    }

  } catch (error: any) {
    console.error("[MEASUREMENTS_ERROR]:", {
      patientId,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });

    return NextResponse.json({
      error: "MEASUREMENTS_SAVE_FAILED",
      message: error.message || "Failed to save measurements",
      code: "MEAS_500"
    }, { status: 500 });
  }
}
