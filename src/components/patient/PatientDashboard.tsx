// src/components/patient/PatientDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Watch, 
  FileText, 
  Calendar,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Heart,
  Moon,
  Flame,
  Scale
} from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface DashboardData {
  patient: {
    firstName: string
    lastName: string
    onboardingCompleted: boolean
    targetWeight?: number
  }
  latestComposition: {
    weight: number
    bodyFatPercentage?: number
    muscleMass?: number
    visceralFatRating?: number
    measuredAt: string
  } | null
  recentMeasurements: Array<{
    type: string
    value: number
    unit: string
    measured_at: string
    source: string
  }>
  wearableStatus: Array<{
    provider: string
    deviceModel?: string
    lastSuccessfulSync?: string
    syncError?: string
  }>
  last7DaysActivity: Array<{
    recordedAt: string
    _sum: {
      steps?: number
      calories?: number
      activeMinutes?: number
    }
  }>
  aiInsights: Array<{
    id: string
    title?: string
    content: string
    category: string
    createdAt: string
    doctor?: {
      user: {
        name?: string
        image?: string
      }
    }
  }>
  quickActions: Array<{
    label: string
    href: string
  }>
}

export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/patient/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard')
      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (err) {
      setError('Error cargando tu dashboard médico')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />
  if (error) return <DashboardError message={error} onRetry={fetchDashboardData} />
  if (!data) return null

  const { patient, latestComposition, wearableStatus, aiInsights, quickActions } = data

  // Calcular diferencia de peso si hay target
  const weightDiff = patient.targetWeight && latestComposition 
    ? latestComposition.weight - patient.targetWeight 
    : null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Hola, <span className="text-cyan-400">{patient.firstName}</span>
            </h1>
            <p className="text-slate-400 mt-1">
              Tu resumen médico en tiempo real
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchDashboardData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
            <Link 
              href="/patient/profile"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold"
            >
              {patient.firstName[0]}
            </Link>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <QuickActionCard key={i} {...action} />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Metrics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Composition Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={<Scale className="w-5 h-5" />}
                label="Peso Actual"
                value={latestComposition ? `${latestComposition.weight.toFixed(1)} kg` : '--'}
                subValue={weightDiff !== null ? (
                  <span className={weightDiff > 0 ? 'text-red-400' : 'text-emerald-400'}>
                    {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg vs meta
                  </span>
                ) : undefined}
                trend={weightDiff !== null ? (weightDiff > 0 ? 'up' : 'down') : undefined}
              />
              
              <MetricCard
                icon={<Activity className="w-5 h-5" />}
                label="Grasa Corporal"
                value={latestComposition?.bodyFatPercentage 
                  ? `${latestComposition.bodyFatPercentage.toFixed(1)}%` 
                  : '--'
                }
                subValue="Rango saludable"
              />
              
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Masa Muscular"
                value={latestComposition?.muscleMass 
                  ? `${latestComposition.muscleMass.toFixed(1)} kg` 
                  : '--'
                }
                trend="up"
              />
              
              <MetricCard
                icon={<AlertCircle className="w-5 h-5" />}
                label="Grasa Visceral"
                value={latestComposition?.visceralFatRating 
                  ? latestComposition.visceralFatRating.toString() 
                  : '--'
                }
                subValue={latestComposition?.visceralFatRating && latestComposition.visceralFatRating > 10 
                  ? <span className="text-yellow-400">Revisar</span>
                  : <span className="text-emerald-400">Normal</span>
                }
              />
            </div>

            {/* Activity Chart */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Actividad Últimos 7 Días</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  Pasos
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.last7DaysActivity.map(d => ({
                    day: new Date(d.recordedAt).toLocaleDateString('es', { weekday: 'short' }),
                    steps: d._sum.steps || 0,
                    calories: d._sum.calories || 0
                  }))}>
                    <defs>
                      <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#475569" fontSize={12} />
                    <YAxis stroke="#475569" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #1e293b',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="steps" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorSteps)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wearable Status */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
              <h3 className="font-semibold text-lg mb-4">Dispositivos Conectados</h3>
              <div className="space-y-3">
                {wearableStatus.length === 0 ? (
                  <div className="text-slate-500 text-center py-8">
                    <Watch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay dispositivos conectados</p>
                    <Link 
                      href="/patient/connections"
                      className="text-cyan-400 hover:underline text-sm mt-2 inline-block"
                    >
                      Conectar dispositivo
                    </Link>
                  </div>
                ) : (
                  wearableStatus.map((device, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          device.syncError ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          <Watch className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{device.provider}</div>
                          <div className="text-sm text-slate-400">
                            {device.deviceModel || 'Dispositivo vinculado'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {device.syncError ? (
                          <span className="text-red-400 text-sm">Error de sincronización</span>
                        ) : (
                          <>
                            <div className="text-emerald-400 text-sm">Sincronizado</div>
                            <div className="text-xs text-slate-500">
                              {device.lastSuccessfulSync 
                                ? new Date(device.lastSuccessfulSync).toLocaleTimeString()
                                : 'Nunca'
                              }
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Insights */}
          <div className="space-y-6">
            
            {/* AI Insights */}
            <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/30 rounded-2xl p-6 border border-cyan-800/30">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold">Insights Clínicos</h3>
              </div>
              
              <div className="space-y-4">
                {aiInsights.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No hay insights recientes. Los análisis de IA aparecerán aquí después de tu próxima sincronización.
                  </p>
                ) : (
                  aiInsights.map((insight) => (
                    <div 
                      key={insight.id}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <span className="text-cyan-400 text-xs font-bold">
                            {insight.doctor?.user.name?.[0] || 'AI'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-cyan-100 mb-1">
                            {insight.title || 'Análisis de Curie AI'}
                          </div>
                          <p className="text-sm text-slate-400 line-clamp-3">
                            {insight.content}
                          </p>
                          <div className="text-xs text-slate-500 mt-2">
                            {new Date(insight.createdAt).toLocaleDateString('es')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Link 
                href="/patient/insights"
                className="flex items-center justify-center gap-2 mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Ver todos los insights
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Recent Measurements */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
              <h3 className="font-semibold text-lg mb-4">Mediciones Recientes</h3>
              <div className="space-y-3">
                {data.recentMeasurements.slice(0, 5).map((m, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <MeasurementIcon type={m.type} />
                      <span className="text-sm text-slate-300">
                        {formatMeasurementType(m.type)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {m.value} {m.unit}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(m.measured_at).toLocaleDateString('es')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sleep Summary (if available) */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold">Sueño</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">7h 24m</div>
                  <div className="text-sm text-slate-400">Promedio últimos 7 días</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 text-sm">+12% vs semana anterior</div>
                  <div className="text-xs text-slate-500">Calidad: Buena</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes auxiliares

function QuickActionCard({ label, href }: { label: string; href: string }) {
  const icons: Record<string, React.ReactNode> = {
    'Sincronizar': <RefreshCw className="w-5 h-5" />,
    'Subir': <FileText className="w-5 h-5" />,
    'Programar': <Calendar className="w-5 h-5" />
  }
  
  const icon = Object.keys(icons).find(k => label.includes(k))
  
  return (
    <Link 
      href={href}
      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 hover:bg-slate-800 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
          {icon ? icons[icon] : <Activity className="w-5 h-5" />}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
    </Link>
  )
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  trend 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  subValue?: React.ReactNode
  trend?: 'up' | 'down'
}) {
  return (
    <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {subValue && (
        <div className="text-xs flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-emerald-400" />}
          {subValue}
        </div>
      )}
    </div>
  )
}

function MeasurementIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    'HEART_RATE': <Heart className="w-4 h-4 text-red-400" />,
    'WEIGHT': <Scale className="w-4 h-4 text-cyan-400" />,
    'STEPS': <Activity className="w-4 h-4 text-emerald-400" />,
    'SLEEP_DURATION': <Moon className="w-4 h-4 text-indigo-400" />,
    'CALORIES_BURNED': <Flame className="w-4 h-4 text-orange-400" />
  }
  
  return (
    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
      {iconMap[type] || <Activity className="w-4 h-4 text-slate-400" />}
    </div>
  )
}

function formatMeasurementType(type: string): string {
  const map: Record<string, string> = {
    'HEART_RATE': 'Frecuencia Cardíaca',
    'WEIGHT': 'Peso',
    'BODY_FAT_PERCENTAGE': 'Grasa Corporal',
    'STEPS': 'Pasos',
    'SLEEP_DURATION': 'Duración Sueño',
    'BLOOD_PRESSURE_SYSTOLIC': 'Presión Sistólica',
    'BLOOD_PRESSURE_DIASTOLIC': 'Presión Diastólica'
  }
  return map[type] || type.replace(/_/g, ' ')
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-20 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-slate-800 rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-slate-800 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-96 bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Error de Conexión</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <button 
          onClick={onRetry}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}