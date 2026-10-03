import { ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: ReactNode;
};

export default function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}
