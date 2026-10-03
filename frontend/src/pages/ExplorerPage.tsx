import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import StatusBadge from '../components/StatusBadge';
import { getDistricts, getGaps, getSectors, getStates, getTrades } from '../services/api';

export default function ExplorerPage() {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState<any[]>([]);
  const [options, setOptions] = useState({ states: [], districts: [], sectors: [], trades: [], years: [2022, 2023, 2024] });

  useEffect(() => {
    Promise.all([getGaps(filters), getStates(), getDistricts(), getSectors(), getTrades()]).then(([gapData, states, districts, sectors, trades]) => {
      setData(gapData);
      setOptions({ states, districts, sectors, trades, years: [2022, 2023, 2024] });
    });
  }, [filters]);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Labour Market Explorer</h1>
        <p className="text-slate-600">Explore district, sector and trade-level demand-supply conditions.</p>
      </div>

      <FilterBar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} options={options} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">State</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">District</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Sector</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Trade</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Demand</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Supply</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Gap</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={`${row.state}-${row.district}-${row.trade}`} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-sm">{row.state}</td>
                  <td className="px-4 py-3 text-sm">{row.district}</td>
                  <td className="px-4 py-3 text-sm">{row.sector}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/trade/${encodeURIComponent(row.trade)}`} className="font-medium text-blue-600 hover:underline">{row.trade}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{row.demand}</td>
                  <td className="px-4 py-3 text-sm">{row.supply}</td>
                  <td className="px-4 py-3 text-sm">{row.gap}</td>
                  <td className="px-4 py-3 text-sm"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
