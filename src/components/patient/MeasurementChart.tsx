/**
 * MeasurementChart.tsx
 * Line/bar charts for biometric data visualization
 */

'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  MeasurementChartProps,
  ChartDataPoint,
  DateRange,
  getMeasurementLabel,
  getMeasurementUnit,
} from './patient-dashboard.types';

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1A' },
  { value: 'all', label: 'Todo' },
];

const CHART_COLORS = {
  primary: '#ef4444',
  secondary: '#3b82f6',
  tertiary: '#10b981',
  quaternary: '#f59e0b',
  quinary: '#8b5cf6',
};

export default function MeasurementChart({
  measurementType,
  data,
  dateRange,
  onDateRangeChange,
  showLegend = true,
  height = 300,
}: MeasurementChartProps) {
  const label = getMeasurementLabel(measurementType);
  const unit = getMeasurementUnit(measurementType);

  // Format data for chart
  const chartData = useMemo(() => {
    return data.map((point: ChartDataPoint) => ({
      ...point,
      formattedDate: new Date(point.date).toLocaleDateString('es-GT', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = lastValue - firstValue;
    const changePercent = ((change / firstValue) * 100).toFixed(1);
    return {
      change,
      changePercent: parseFloat(changePercent),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">
            {new Date(dataPoint.date).toLocaleDateString('es-GT', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-white font-semibold text-lg">
            {payload[0].value.toFixed(1)} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Choose chart type based on measurement type
  const isBarChart = [
    'STEPS',
    'ACTIVE_MINUTES',
    'CALORIES_BURNED',
  ].includes(measurementType);

  return (
    <div className="bg-slate-900/40 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{label}</h3>
          {trend && (
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-sm font-medium ${
                  trend.direction === 'up'
                    ? 'text-emerald-400'
                    : trend.direction === 'down'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
                {Math.abs(trend.change).toFixed(1)} {unit}
              </span>
              <span className="text-slate-500 text-sm">
                ({trend.direction === 'up' ? '+' : ''}
                {trend.changePercent}%)
              </span>
            </div>
          )}
        </div>

        {/* Date Range Selector */}
        {onDateRangeChange && (
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onDateRangeChange(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  dateRange === option.value
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {isBarChart ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar
                dataKey="value"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
                name={label}
              />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill="url(#colorValue)"
                name={label}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      {data.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
          <div className="text-slate-400 text-sm">
            <span className="text-white font-medium">{data.length}</span> registros
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              Min: <span className="text-white">{Math.min(...data.map((d) => d.value)).toFixed(1)} {unit}</span>
            </span>
            <span className="text-slate-400">
              Max: <span className="text-white">{Math.max(...data.map((d) => d.value)).toFixed(1)} {unit}</span>
            </span>
            <span className="text-slate-400">
              Prom: <span className="text-white">{(data.reduce((a, b) => a + b.value, 0) / data.length).toFixed(1)} {unit}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
