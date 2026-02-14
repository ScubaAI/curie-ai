// src/app/(doctor)/dashboard/page.tsx
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  Users,
  Activity,
  AlertCircle,
  Calendar,
  TrendingUp,
  Zap,
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  Clock,
  HeartPulse,
  ChevronRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { StatCard } from '@/components/doctor/dashboard/StatCard';
import { AlertBanner } from '@/components/doctor/dashboard/AlertBanner';
import { PatientCard } from '@/components/doctor/patients/PatientCard';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface PatientWithRisk {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  lastComposition?: {
    weight: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    measuredAt: Date;
  };
  lastSync?: Date;
  alerts: ClinicalAlert[];
}

interface ClinicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'glucose' | 'heart' | 'weight' | 'sync' | 'composition';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: Date;
  metadata?: any;
}

// ============================================================================
// RISK ENGINE
// ============================================================================

function calculateRiskScore(patient: any): { level: 'low' | 'medium' | 'high'; score: number } {
  const composition = patient.compositions[0];
  if (!composition) return { level: 'medium', score: 50 };

  let score = 0;
  let riskFactors = 0;

  // Grasa corporal
  if (composition.bodyFatPercentage) {
    if (composition.bodyFatPercentage > 35) { score += 30; riskFactors++; }
    else if (composition.bodyFatPercentage > 28) { score += 15; riskFactors++; }
  }

  // Grasa visceral
  if (composition.visceralFatRating) {
    if (composition.visceralFatRating > 15) { score += 25; riskFactors++; }
    else if (composition.visceralFatRating > 10) { score += 10; riskFactors++; }
  }

  // Ángulo de fase (nutrición celular)
  if (composition.phaseAngle && composition.phaseAngle < 5) {
    score += 20; riskFactors++;
  }

  // Sincronización reciente
  const lastSync = patient.wearables[0]?.lastSuccessfulSync;
  if (lastSync) {
    const daysSinceSync = Math.floor((Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceSync > 7) { score += 15; riskFactors++; }
  } else {
    score += 10; // Sin wearables
  }

  // Determinar nivel
  let level: 'low' | 'medium' | 'high' = 'low';
  if (score >= 40 || riskFactors >= 3) level = 'high';
  else if (score >= 20 || riskFactors >= 2) level = 'medium';

  return { level, score: Math.min(score, 100) };
}

function generateAlertsForPatient(patient: any): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const composition = patient.compositions[0];
  const fullName = `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || 'Paciente';

  // Alerta de glucosa (simulada - en prod vendría de measurements)
  const recentGlucose = patient.vitalLogs?.find((v: any) => v.type === 'BLOOD_GLUCOSE');
  if (recentGlucose && recentGlucose.value > 140) {
    alerts.push({
      id: `glucose-${patient.id}`,
      patientId: patient.id,
      patientName: fullName,
      type: 'glucose',
      message: `Hiperglucemia persistente (${recentGlucose.value} mg/dL)`,
      severity: recentGlucose.value > 180 ? 'critical' : 'warning',
      timestamp: recentGlucose.measuredAt,
    });
  }

  // Alerta de peso drástico
  if (patient.compositions.length >= 2) {
    const [latest, prev] = [patient.compositions[0], patient.compositions[1]];
    const diff = Math.abs(latest.weight - prev.weight);
    if (diff > 3) {
      alerts.push({
        id: `weight-${latest.id}`,
        patientId: patient.id,
        patientName: fullName,
        type: 'weight',
        message: `Cambio de peso significativo (${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg)`,
        severity: diff > 5 ? 'critical' : 'warning',
        timestamp: latest.measuredAt,
      });
    }
  }

  // Alerta de sincronización
  const wearable = patient.wearables[0];
  if (wearable?.lastSuccessfulSync) {
    const daysSince = Math.floor((Date.now() - new Date(wearable.lastSuccessfulSync).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 3) {
      alerts.push({
        id: `sync-${wearable.id}`,
        patientId: patient.id,
        patientName: fullName,
        type: 'sync',
        message: `Sin sincronización hace ${daysSince} días`,
        severity: daysSince > 7 ? 'critical' : daysSince > 5 ? 'warning' : 'info',
        timestamp: new Date(wearable.lastSuccessfulSync),
      });
    }
  }

  return alerts;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Fix for React hooks purity violation - move Date.now() outside render
const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

export default async function DoctorDashboard() {
  const token = await getAccessToken();
  if (!token) redirect('/login');

  const payload = verifyAccessToken(token);
  const doctor = await prisma.doctor.findUnique({
    where: { userId: payload.userId },
    include: {
      user: true,
      appointments: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        include: { patient: { include: { user: true } } }
      }
    }
  });

  if (!doctor) redirect('/onboarding/doctor');

  // Fetch ALL patients with their latest data for risk analysis
  const patientRelationships = await prisma.doctorPatientRelationship.findMany({
    where: {
      doctorId: doctor.id,
      status: 'active'
    },
    include: {
      patient: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true, dateOfBirth: true } },
          compositions: {
            orderBy: { measuredAt: 'desc' },
            take: 2
          },
          wearables: {
            where: { isActive: true },
            orderBy: { lastSuccessfulSync: 'desc' },
            take: 1
          },
          vitalLogs: {
            orderBy: { measuredAt: 'desc' },
            take: 3
          }
        }
      }
    }
  });

  // Enrich patients with risk scores and alerts
  const patientsWithRisk: PatientWithRisk[] = patientRelationships.map(rel => {
    const risk = calculateRiskScore(rel.patient);
    const alerts = generateAlertsForPatient(rel.patient);

    return {
      id: rel.patient.id,
      firstName: rel.patient.user.firstName || '',
      lastName: rel.patient.user.lastName || '',
      email: rel.patient.user.email,
      age: rel.patient.user.dateOfBirth
        ? new Date().getFullYear() - new Date(rel.patient.user.dateOfBirth).getFullYear()
        : undefined,
      riskLevel: risk.level,
      riskScore: risk.score,
      lastComposition: rel.patient.compositions[0] ? {
        weight: rel.patient.compositions[0].weight,
        bodyFatPercentage: rel.patient.compositions[0].bodyFatPercentage || undefined,
        muscleMass: rel.patient.compositions[0].muscleMass || undefined,
        measuredAt: rel.patient.compositions[0].measuredAt
      } : undefined,
      lastSync: rel.patient.wearables[0]?.lastSuccessfulSync || undefined,
      alerts
    };
  });

  // Aggregate all alerts
  const allAlerts = patientsWithRisk.flatMap(p => p.alerts);
  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = allAlerts.filter(a => a.severity === 'warning');

  // Stats
  const totalPatients = patientsWithRisk.length;
  const highRiskPatients = patientsWithRisk.filter(p => p.riskLevel === 'high').length;
  const avgRiskScore = patientsWithRisk.length > 0
    ? Math.round(patientsWithRisk.reduce((acc, p) => acc + p.riskScore, 0) / patientsWithRisk.length)
    : 0;

  // Mediciones últimos 30 días
  const recentMeasurementsCount = await prisma.compositionRecord.count({
    where: {
      patient: {
        careTeam: { some: { doctorId: doctor.id } }
      },
      measuredAt: { gte: THIRTY_DAYS_AGO }
    }
  });

  // Sort patients by risk (high first) then by recent activity
  const sortedPatients = patientsWithRisk.sort((a, b) => {
    if (a.riskLevel !== b.riskLevel) {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return (b.lastComposition?.measuredAt?.getTime() || 0) - (a.lastComposition?.measuredAt?.getTime() || 0);
  });

  const recentPatients = sortedPatients.slice(0, 4);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Bienvenido,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Dr. {doctor.user.lastName}
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg flex items-center gap-2">
            {criticalAlerts.length > 0 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-rose-400 font-semibold">
                  {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? 's' : ''} crítica{criticalAlerts.length > 1 ? 's' : ''} requiere{criticalAlerts.length > 1 ? 'n' : ''} atención inmediata
                </span>
              </>
            ) : warningAlerts.length > 0 ? (
              <>
                <Info className="w-5 h-5 text-amber-500" />
                {warningAlerts.length} alertas de seguimiento pendientes
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Todos tus pacientes están estables
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/doctor/advisor"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/20 transition-all font-bold text-sm group"
          >
            <BrainCircuit className="w-5 h-5 group-hover:animate-pulse" />
            Asesor Arkangel AI
          </Link>
          <Link
            href="/doctor/appointments"
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <Calendar className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Pacientes"
          value={totalPatients}
          icon={Users}
          color="bg-emerald-500"
          trend={totalPatients > 0 ? { value: 12, isUp: true } : undefined}
        />
        <StatCard
          label="Mediciones (30d)"
          value={recentMeasurementsCount}
          icon={Activity}
          color="bg-cyan-500"
        />
        <StatCard
          label="Pacientes de Alto Riesgo"
          value={highRiskPatients}
          icon={AlertTriangle}
          color={highRiskPatients > 0 ? "bg-rose-500" : "bg-indigo-500"}
        />
        <StatCard
          label="Consultas Hoy"
          value={doctor.appointments.filter(a => {
            const today = new Date();
            const appt = new Date(a.scheduledAt);
            return appt.toDateString() === today.toDateString();
          }).length}
          icon={Calendar}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Critical Alerts Section */}
          {allAlerts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  Alertas Clínicas ({allAlerts.length})
                </h2>
                <Link href="/doctor/alerts" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">
                  Ver todas
                </Link>
              </div>

              <div className="space-y-3">
                {allAlerts.slice(0, 5).map(alert => (
                  <Link
                    key={alert.id}
                    href={`/doctor/patient/${alert.patientId}/overview`}
                    className="block group"
                  >
                    <div className={`p-4 rounded-2xl border transition-all duration-300 ${alert.severity === 'critical'
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-950/30'
                      : alert.severity === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-950/30'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl ${alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                            alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                            {alert.type === 'glucose' ? <Activity className="w-4 h-4" /> :
                              alert.type === 'heart' ? <HeartPulse className="w-4 h-4" /> :
                                alert.type === 'weight' ? <TrendingUp className="w-4 h-4" /> :
                                  <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {alert.patientName}
                            </h4>
                            <p className={`text-sm mt-0.5 ${alert.severity === 'critical' ? 'text-rose-300' :
                              alert.severity === 'warning' ? 'text-amber-300' :
                                'text-slate-400'
                              }`}>
                              {alert.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(alert.timestamp).toLocaleString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Patients */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                {highRiskPatients > 0 ? 'Pacientes Prioritarios' : 'Pacientes Recientes'}
              </h2>
              <Link href="/doctor/patients" className="text-sm text-slate-500 hover:text-white flex items-center gap-1 group">
                Ver todos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPatients.map(patient => (
                <Link key={patient.id} href={`/doctor/patient/${patient.id}/overview`}>
                  <PatientCard
                    patient={patient}
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-10">
          {/* Appointments */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Próximas Citas
            </h3>

            {doctor.appointments.length > 0 ? (
              <div className="space-y-6">
                {doctor.appointments.map(appt => {
                  const date = new Date(appt.scheduledAt);
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <Link
                      key={appt.id}
                      href={`/doctor/appointments/${appt.id}`}
                      className="flex gap-4 group cursor-pointer"
                    >
                      <div className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl border transition-all ${isToday
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:border-emerald-500/40 group-hover:text-emerald-400'
                        }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {date.toLocaleDateString('es-MX', { month: 'short' })}
                        </span>
                        <span className="text-xl font-black tracking-tighter">
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {appt.type || 'Consulta de Control'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {appt.isVirtual ? 'Videoconsulta' : 'Presencial'}
                        </p>
                        {appt.patient && (
                          <p className="text-xs text-slate-600 mt-1">
                            {appt.patient.user.firstName} {appt.patient.user.lastName}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay citas programadas</p>
              </div>
            )}

            <Link
              href="/doctor/appointments"
              className="w-full mt-8 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all text-center block"
            >
              Ver Agenda Completa
            </Link>
          </div>

          {/* Curie Insights */}
          <div className="p-1 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/5 overflow-hidden">
            <div className="p-6 bg-slate-950/80 rounded-[22px] backdrop-blur-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white">Curie Insights</h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {recentMeasurementsCount > 0
                  ? `El ${Math.round((recentMeasurementsCount / totalPatients) * 100)}% de tus pacientes han registrado mediciones este mes. ${highRiskPatients > 0 ? `Revisa los ${highRiskPatients} casos de alto riesgo.` : 'Todos muestran buena adherencia.'}`
                  : 'Tus pacientes están comenzando su journey. La adherencia mejora con recordatorios personalizados.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}