import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import StatusBadge from '../components/StatusBadge';
import { getAlerts, getDistricts, getSectors, getStates, getTrades } from '../services/api';

export default function AlertsPage() {
  const [filters, setFilters] = useState({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [options, setOptions] = useState({ states: [], districts: [], sectors: [], trades: [], years: [2022, 2023, 2024] });

  useEffect(() => {
    Promise.all([getAlerts(filters), getStates(), getDistricts(), getSectors(), getTrades()]).then(([alertData, states, districts, sectors, trades]) => {
      setAlerts(alertData);
      setOptions({ states, districts, sectors, trades, years: [2022, 2023, 2024] });
    });
  }, [filters]);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Early Warnings</h1>
        <p className="text-slate-600">Detect emerging shortage or oversupply conditions before they become structural.</p>
      </div>

      <FilterBar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} options={options} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {alerts.map((alert) => (
          <div key={`${alert.district}-${alert.trade}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">{alert.trade}</div>
                <div className="text-sm text-slate-500">{alert.district} • {alert.sector}</div>
              </div>
              <StatusBadge status={alert.alert_type} />
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Current gap</span><span>{alert.current_gap}</span></div>
              <div className="flex justify-between"><span>Forecast gap</span><span>{alert.forecast_gap}</span></div>
              <div className="mt-3 text-slate-700">{alert.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
