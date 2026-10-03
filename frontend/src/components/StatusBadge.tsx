type StatusBadgeProps = {
  status: string;
};

const statusClasses: Record<string, string> = {
  'Critical Shortage': 'bg-red-100 text-red-700',
  'Moderate Shortage': 'bg-amber-100 text-amber-700',
  Balanced: 'bg-emerald-100 text-emerald-700',
  'Moderate Oversupply': 'bg-violet-100 text-violet-700',
  'Critical Oversupply': 'bg-slate-200 text-slate-700',
  CRITICAL_SHORTAGE: 'bg-red-100 text-red-700',
  SHORTAGE_RISK: 'bg-amber-100 text-amber-700',
  OVERSUPPLY_RISK: 'bg-violet-100 text-violet-700',
  STABLE: 'bg-emerald-100 text-emerald-700',
  'EMERGING DEMAND': 'bg-blue-100 text-blue-700',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}
