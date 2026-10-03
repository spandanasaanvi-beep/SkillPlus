import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import FilterBar from '../components/FilterBar';
import { getDistricts, getForecast, getSectors, getStates, getTrades } from '../services/api';

export default function ForecastPage() {
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState<any[]>([]);
  const [options, setOptions] = useState({ states: [], districts: [], sectors: [], trades: [], years: [2022, 2023, 2024] });

  useEffect(() => {
    Promise.all([getForecast(filters), getStates(), getDistricts(), getSectors(), getTrades()]).then(([forecastData, states, districts, sectors, trades]) => {
      setRows(forecastData);
      setOptions({ states, districts, sectors, trades, years: [2022, 2023, 2024] });
    });
  }, [filters]);

  const chartData = rows.map((row) => ({ name: row.trade || row.state, demand: row.forecast_demand ?? 0, gap: row.forecast_gap ?? 0 }));

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Forecasts</h1>
        <p className="text-slate-600">Forecasts are model-based estimates using available historical signals.</p>
      </div>

      <FilterBar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} options={options} />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Forecast trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="demand" stroke="#0f766e" fill="#99f6e4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
