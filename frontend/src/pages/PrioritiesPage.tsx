import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import { getDistricts, getPriorities, getSectors, getStates, getTrades } from '../services/api';

export default function PrioritiesPage() {
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState<any[]>([]);
  const [options, setOptions] = useState({ states: [], districts: [], sectors: [], trades: [], years: [2022, 2023, 2024] });

  useEffect(() => {
    Promise.all([getPriorities(filters), getStates(), getDistricts(), getSectors(), getTrades()]).then(([priorityData, states, districts, sectors, trades]) => {
      setRows(priorityData);
      setOptions({ states, districts, sectors, trades, years: [2022, 2023, 2024] });
    });
  }, [filters]);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Priority Insights</h1>
        <p className="text-slate-600">AI-generated planning priority based on available data.</p>
      </div>

      <FilterBar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} options={options} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Rank</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Trade</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">District</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Gap</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Forecast Gap</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Priority Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.trade}-${row.district}`} className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm">#{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{row.trade}</td>
                <td className="px-4 py-3 text-sm">{row.district}</td>
                <td className="px-4 py-3 text-sm">{row.gap_value}</td>
                <td className="px-4 py-3 text-sm">{row.forecast_gap}</td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-700">{row.priority_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
