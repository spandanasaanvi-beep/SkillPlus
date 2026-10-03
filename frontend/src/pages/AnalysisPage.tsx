import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import StatusBadge from '../components/StatusBadge';
import { getDistricts, getGaps, getSectors, getStates, getTrades } from '../services/api';

export default function AnalysisPage() {
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState<any[]>([]);
  const [options, setOptions] = useState({ states: [], districts: [], sectors: [], trades: [], years: [2022, 2023, 2024] });

  useEffect(() => {
    Promise.all([getGaps(filters), getStates(), getDistricts(), getSectors(), getTrades()]).then(([gapData, states, districts, sectors, trades]) => {
      setRows(gapData.reverse().slice(0, 12));
      setOptions({ states, districts, sectors, trades, years: [2022, 2023, 2024] });
    });
  }, [filters]);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Demand & Supply Analysis</h1>
        <p className="text-slate-600">Compare demand and supply across the core skill categories with planning-relevant indicators.</p>
      </div>

      <FilterBar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} options={options} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={`${row.state}-${row.trade}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">{row.trade}</div>
                <div className="text-sm text-slate-500">{row.district} • {row.sector}</div>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Demand</span><span>{row.demand}</span></div>
              <div className="flex justify-between"><span>Supply</span><span>{row.supply}</span></div>
              <div className="flex justify-between"><span>Gap</span><span>{row.gap}</span></div>
              <div className="flex justify-between"><span>Gap %</span><span>{row.gap_pct}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
