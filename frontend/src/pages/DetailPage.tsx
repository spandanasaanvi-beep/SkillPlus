import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGaps } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function DetailPage() {
  const { tradeName } = useParams();
  const [row, setRow] = useState<any>(null);

  useEffect(() => {
    if (!tradeName) return;
    const decoded = decodeURIComponent(tradeName);
    getGaps({ trade: decoded }).then((data) => setRow(data[0] ?? null));
  }, [tradeName]);

  if (!row) {
    return <div className="py-10 text-center">Loading trade detail…</div>;
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{row.trade}</h1>
          <p className="text-slate-600">{row.district} • {row.sector} • {row.state}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">Demand</div><div className="mt-2 text-2xl font-bold">{row.demand}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">Supply</div><div className="mt-2 text-2xl font-bold">{row.supply}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">Gap</div><div className="mt-2 text-2xl font-bold">{row.gap}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">Forecast</div><div className="mt-2 text-2xl font-bold">{row.gap_pct}%</div></div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Planning insight</h2>
        <p className="mt-3 text-slate-600">This trade sits in a {row.status.toLowerCase()} position relative to current labour demand and supply. Skilled planners should monitor the trend closely and align training capacity with district-level hiring signals.</p>
      </div>
    </div>
  );
}
