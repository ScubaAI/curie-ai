'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Activity,
    Calendar,
    Cpu,
    Watch,
    FileText,
    Loader2,
    AlertCircle,
    User,
    Stethoscope,
    ArrowLeft,
    MoreVertical,
    Edit3,
    AlertTriangle
} from 'lucide-react';

import { CompositionTable } from '@/components/admin/CompositionTable';
import { AdvancedMetrics } from '@/components/admin/AdvancedMetrics';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdvisorChat } from '@/components/doctor/advisor/AdvisorChat';
import CalScheduling from '@/components/CalScheduling';
import ProtocolModal from '@/components/ProtocolModal';
import MetricCard from '@/components/MetricCard';

// ── Interfaces ────────────────────────────────────────────────
interface PatientData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    height?: number;
    targetWeight?: number;
    phone?: string;
    lastVisit?: string;
    riskLevel?: 'low' | 'medium' | 'high';
}

interface Composition {
    id: string;
    date: string;
    weight: number;
    smm?: number;
    pbf?: number;
    bodyFatMass?: number;
    phaseAngle?: number;
    bmr?: number;
    vfl?: number;
}

interface WearableStatus {
    provider: string;
    deviceModel?: string;
    lastSuccessfulSync?: string;
    syncError?: string;
    batteryLevel?: number;
}

interface DashboardData {
    patient: PatientData;
    compositions: Composition[];
    wearableStatus: WearableStatus[];
    hasWithings: boolean;
    goals?: string[];
    notes?: string[];
    alerts?: Array<{
        id: string;
        type: 'weight' | 'composition' | 'sync' | 'compliance';
        message: string;
        severity: 'info' | 'warning' | 'critical';
        date: string;
    }>;
}

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (date: string | Date | null): string => {
    if (!date) return 'Sin datos recientes';
    return new Date(date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// ── Page Component ────────────────────────────────────────────
export default function DoctorPatientOverviewPage() {
    const router = useRouter();
    const params = useParams();
    // CHANGED: params.patientId -> params.id to match file structure [id]
    const patientId = params.id as string;

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProtocolOpen, setIsProtocolOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'history'>('overview');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (patientId) {
            fetchPatientData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            const res = await fetch(`/api/doctor/patients/${patientId}/dashboard`);
            if (res.status === 401) { router.push('/login'); return; }
            if (res.status === 403) { setError('No tienes permiso para ver este paciente'); return; }
            if (!res.ok) throw new Error('Error cargando datos del paciente');

            const dashboardData = await res.json();
            setData(dashboardData);
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Cálculos clínicos
    const latest = data?.compositions[0] ?? null;
    const previous = data?.compositions[1] ?? null;
    const weightChange = latest && previous ? latest.weight - previous.weight : 0;
    const smmChange = latest && previous ? (latest.smm || 0) - (previous.smm || 0) : 0;
    const pbfChange = latest && previous ? (latest.pbf || 0) - (previous.pbf || 0) : 0;

    const getClinicalTrend = (metric: 'weight' | 'smm' | 'pbf', change: number) => {
        if (change === 0) return 'stable';
        if (metric === 'weight') return change < 0 ? 'positive' : 'negative';
        if (metric === 'smm') return change > 0 ? 'positive' : 'negative';
        if (metric === 'pbf') return change < 0 ? 'positive' : 'negative';
        return 'neutral';
    };

    // ── Loading & Error states ──────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-14 h-14 text-emerald-500 animate-spin mx-auto" />
                    <p className="text-slate-300 text-lg">Cargando expediente clínico...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-20 h-20 text-red-500/70 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-3">Error de acceso</h2>
                    <p className="text-slate-300 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { patient, compositions, hasWithings, alerts } = data;

    // ── Render ──────────────────────────────────────────────────
    return (
        <>
            <ProtocolModal
                isOpen={isProtocolOpen}
                onClose={() => setIsProtocolOpen(false)}
                nutritionDoc={{
                    id: 'nutrition-001',
                    title: 'Protocolo Nutricional',
                    description: 'Configuración macro-nutricional personalizada',
                    fileUrl: '#',
                    fileSize: '1.2 MB',
                    updatedAt: new Date(),
                    version: '2.1',
                    checksum: 'sha256-abc',
                }}
                workoutDoc={{
                    id: 'workout-001',
                    title: 'Rutina de Entrenamiento',
                    description: 'Hipertrofia y fuerza adaptada a composición',
                    fileUrl: '#',
                    fileSize: '0.8 MB',
                    updatedAt: new Date(),
                    version: '1.5',
                    checksum: 'sha256-def',
                }}
                prescriptions={[]}
            />

            <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
                <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

                    {/* ─── Header Médico ─────────────────────────────── */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="rounded-full p-2 hover:bg-slate-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </button>

                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-bold text-white">
                                        {patient.firstName} {patient.lastName}
                                    </h1>
                                    {patient.riskLevel && (
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${patient.riskLevel === 'high'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : patient.riskLevel === 'medium'
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                }`}
                                        >
                                            Riesgo{' '}
                                            {patient.riskLevel === 'high'
                                                ? 'Alto'
                                                : patient.riskLevel === 'medium'
                                                    ? 'Medio'
                                                    : 'Bajo'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-4 h-4" />
                                        {patient.age} años • {patient.height} cm
                                    </span>
                                    <span>•</span>
                                    <span>{patient.email}</span>
                                    {patient.phone && (
                                        <>
                                            <span>•</span>
                                            <span>{patient.phone}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsProtocolOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors text-sm font-medium"
                            >
                                <FileText className="w-4 h-4 text-emerald-400" />
                                Ver Protocolo
                            </button>

                            {/* Simple dropdown (no external dependency) */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="rounded-full p-2 hover:bg-slate-800 transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                                {showDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <button
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                Editar paciente
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <Stethoscope className="w-4 h-4" />
                                                Nueva consulta
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Alertas Clínicas ──────────────────────────── */}
                    {alerts && alerts.length > 0 && (
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-xl border flex items-center gap-3 ${alert.severity === 'critical'
                                        ? 'bg-red-950/30 border-red-500/30 text-red-200'
                                        : alert.severity === 'warning'
                                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                                            : 'bg-blue-950/30 border-blue-500/30 text-blue-200'
                                        }`}
                                >
                                    <AlertTriangle
                                        className={`w-5 h-5 ${alert.severity === 'critical'
                                            ? 'text-red-400'
                                            : alert.severity === 'warning'
                                                ? 'text-amber-400'
                                                : 'text-blue-400'
                                            }`}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{alert.message}</p>
                                        <p className="text-xs opacity-70">{formatDate(alert.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ─── Tabs ──────────────────────────────────────── */}
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
                        {([
                            { id: 'overview' as const, label: 'Vista General', icon: Activity },
                            { id: 'chat' as const, label: 'Asesor IA', icon: Cpu },
                            { id: 'history' as const, label: 'Historial Completo', icon: Calendar },
                        ]).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-1 ${activeTab === tab.id
                                    ? 'text-emerald-400 border-emerald-400'
                                    : 'text-slate-400 border-transparent hover:text-slate-200'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ─── Tab: Overview ─────────────────────────────── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {latest && (
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <Activity className="w-7 h-7 text-emerald-500" />
                                            Métricas Actuales
                                        </h2>
                                        <span className="text-sm text-slate-500">
                                            Última medición: {formatDate(latest.date)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <MetricCard
                                            label="Peso"
                                            value={latest.weight}
                                            unit="kg"
                                            trend={
                                                weightChange !== 0
                                                    ? {
                                                        value: Math.abs(weightChange),
                                                        isUp: weightChange < 0,
                                                        label: weightChange < 0 ? 'Pérdida' : 'Ganancia'
                                                    }
                                                    : undefined
                                            }
                                            description={`Tendencia: ${getClinicalTrend('weight', weightChange)}`}
                                            clinicalContext={weightChange > 2 ? 'Revisar adherencia' : undefined}
                                            color="emerald"
                                        />

                                        <MetricCard
                                            label="Masa Muscular (SMM)"
                                            value={latest.smm ?? '—'}
                                            unit="kg"
                                            trend={
                                                smmChange !== 0
                                                    ? {
                                                        value: Math.abs(smmChange),
                                                        isUp: smmChange > 0,
                                                        label: smmChange > 0 ? 'Ganancia' : 'Pérdida'
                                                    }
                                                    : undefined
                                            }
                                            description={`Tendencia: ${getClinicalTrend('smm', smmChange)}`}
                                            clinicalContext={smmChange < -1 ? 'Posible sarcopenia' : undefined}
                                            color="cyan"
                                        />

                                        <MetricCard
                                            label="% Grasa Corporal"
                                            value={latest.pbf ?? '—'}
                                            unit="%"
                                            inverseTrend={true}
                                            trend={
                                                pbfChange !== 0
                                                    ? {
                                                        value: Math.abs(pbfChange),
                                                        isUp: pbfChange < 0,
                                                        inverseTrend: true,
                                                        label: pbfChange < 0 ? 'Reducción' : 'Aumento'
                                                    }
                                                    : undefined
                                            }
                                            description={`Masa grasa: ${latest.bodyFatMass?.toFixed(1) ?? '—'} kg`}
                                            clinicalContext={latest.pbf && latest.pbf > 30 ? 'Riesgo metabólico' : undefined}
                                            color="rose"
                                        />
                                    </div>

                                    {/* Advanced Metrics */}
                                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                                        <AdvancedMetrics
                                            composition={{
                                                weight: latest.weight,
                                                bodyFatPercentage: latest.pbf ?? null,
                                                muscleMass: latest.smm ?? null,
                                                visceralFatRating: latest.vfl ?? null,
                                                phaseAngle: latest.phaseAngle ?? null,
                                                bmr: latest.bmr ?? null,
                                            } as any}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Quick-action grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <section className="space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        <Calendar className="w-6 h-6 text-emerald-500" />
                                        Agendar Consulta
                                    </h2>
                                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                                        <CalScheduling
                                            calUsername="dr-tu-usuario"
                                            eventType="consulta-medica"
                                        />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        <Watch className="w-6 h-6 text-cyan-500" />
                                        Dispositivos Wearables
                                    </h2>
                                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
                                        {hasWithings ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                            <Watch className="w-5 h-5 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">Withings Conectado</p>
                                                            <p className="text-xs text-slate-400">
                                                                Última sinc: {formatDate(data.wearableStatus[0]?.lastSuccessfulSync ?? null)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                                                        Activo
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-500">
                                                <Watch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                <p>Paciente sin dispositivos conectados</p>
                                                <button className="mt-4 px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                                                    Enviar invitación
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Recent compositions (last 5) */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-bold">Composiciones Recientes</h2>
                                {compositions.length > 0 ? (
                                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                        <CompositionTable
                                            compositions={compositions.slice(0, 5).map((c) => ({
                                                ...c,
                                                date: new Date(c.date || Date.now()),
                                            })) as any}
                                            formatDate={formatDate}
                                        />
                                    </div>
                                ) : (
                                    <EmptyState />
                                )}
                            </section>
                        </div>
                    )}

                    {/* ─── Tab: Chat ─────────────────────────────────── */}
                    {activeTab === 'chat' && (
                        <div className="h-[calc(100vh-300px)] min-h-[600px] animate-in fade-in duration-500">
                            <AdvisorChat
                                doctorId="current-doctor-id"
                                patientId={patient.id}
                            />
                        </div>
                    )}

                    {/* ─── Tab: History ──────────────────────────────── */}
                    {activeTab === 'history' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <CompositionTable
                                compositions={compositions.map((c) => ({
                                    ...c,
                                    date: new Date(c.date || Date.now()),
                                })) as any}
                                formatDate={formatDate}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
