import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color: string;
}

export default function MetricCard({ title, value, unit, icon: Icon, color }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <Icon className={color} size={20} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-slate-500 text-sm">{unit}</span>
      </div>
    </div>
  );
}
