import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, BarChart3, Briefcase, Building2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getAlerts, getDashboardData, getDemandSupply, getDistricts, getForecast, getGaps, getProfile, getSectors, getStates, getTrades } from '../services/api';

const DEFAULT_YEAR = 2024;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ qualification: '', skill: '', occupation: '', sector: '', state: '', district: '', year: DEFAULT_YEAR });
  const [gaps, setGaps] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [market, setMarket] = useState<any>(null);
  const [options, setOptions] = useState({ states: [], districts: [], sectors: [], trades: [], years: [2022, 2023, 2024] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getProfile();
    if (!profile) {
      navigate('/');
      return;
    }

    setFilters({
      qualification: profile.qualification || '',
      skill: profile.skills?.[0] || '',
      occupation: profile.preferredJob || '',
      sector: profile.sector || '',
      state: profile.state || '',
      district: profile.district || '',
      year: DEFAULT_YEAR,
    });
  }, [navigate]);

  useEffect(() => {
    const hasFilters = Object.values(filters).some((value) => value !== '' && value !== undefined && value !== null);
    if (!hasFilters) return;

    setLoading(true);
    Promise.all([
      getDashboardData(filters),
      getDemandSupply(filters),
      getForecast(filters),
      getAlerts(filters),
      getStates(),
      getDistricts(filters.state || undefined),
      getSectors(),
      getTrades(),
    ]).then(([marketData, gapData, forecastData, alertData, states, districts, sectors, trades]) => {
      setMarket(marketData);
      setGaps(gapData);
      setAlerts(alertData);
      setOptions({ states, districts, sectors, trades, years: [2022, 2023, 2024] });
      setLoading(false);
    }).catch(() => {
      setMarket(null);
      setGaps([]);
      setAlerts([]);
      setLoading(false);
    });
  }, [filters]);

  useEffect(() => {
    if (!filters.state) {
      setOptions((prev) => ({ ...prev, districts: [] }));
      return;
    }

    getDistricts(filters.state).then((districts) => {
      setOptions((prev) => ({ ...prev, districts }));
      if (filters.district && !districts.includes(filters.district)) {
        setFilters((prev) => ({ ...prev, district: '' }));
      }
    }).catch(() => setOptions((prev) => ({ ...prev, districts: [] })));
  }, [filters.state]);

  const chartData = useMemo(() => gaps.slice(0, 8).map((row) => ({ name: row.trade, demand: row.demand, supply: row.supply, gap: row.gap })), [gaps]);
  const sectorData = useMemo(() => {
    const grouped = new Map<string, number>();
    gaps.forEach((row) => {
      grouped.set(row.sector, (grouped.get(row.sector) ?? 0) + Number(row.gap || 0));
    });
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
  }, [gaps]);

  const summary = market?.summary || { demand: 0, supply: 0, gap: 0, status: 'Balanced', forecast_demand: 0 };

  if (loading && !market) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading labour-market analysis...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Labour Market Analysis</h1>
          <p className="text-sm text-slate-600">Prototype using sample labour-market data</p>
          <p className="text-slate-600">{filters.occupation || filters.skill || 'Your selected occupation'} • {filters.state || 'All states'} • {filters.district || 'All districts'}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Active profile: {filters.occupation || filters.skill || 'Your profile'} • {filters.state || 'All states'}
        </div>
      </div>

      <FilterBar filters={filters} onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} options={options} />

      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard title="Total Labour Demand" value={summary.demand} subtitle="Current demand signal" icon={<Building2 className="h-5 w-5 text-blue-600" />} />
        <MetricCard title="Available Labour Supply" value={summary.supply} subtitle="Current supply pipeline" icon={<Briefcase className="h-5 w-5 text-violet-600" />} />
        <MetricCard title="Demand-Supply Gap" value={summary.gap} subtitle="Demand minus supply" icon={<BarChart3 className="h-5 w-5 text-emerald-600" />} />
        <MetricCard title="Demand Growth" value={summary.forecast_demand} subtitle="Projected market movement" icon={<TrendingUp className="h-5 w-5 text-amber-600" />} />
        <MetricCard title="Current Status" value={summary.status} subtitle="Shortage signal" icon={<Activity className="h-5 w-5 text-slate-600" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Demand vs Supply</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="demand" fill="#2563eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="supply" fill="#94a3b8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Shortage vs Oversupply</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Shortage', value: Math.max(0, Number(summary.gap || 0)) },
                  { name: 'Balanced', value: Math.max(0, 100 - Math.abs(Number(summary.gap || 0))) },
                ]} dataKey="value" nameKey="name" outerRadius={90} fill="#8884d8" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Historical Demand</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={market?.trend || [{ year: DEFAULT_YEAR, demand: summary.demand, supply: summary.supply, gap: summary.gap }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="demand" stroke="#2563eb" fill="#bfdbfe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Forecast Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={market?.forecast || [{ year: DEFAULT_YEAR, forecast_demand: summary.forecast_demand, forecast_gap: summary.gap }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="forecast_demand" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Early Warning Alerts</h2>
        </div>
        {(market?.alerts || alerts).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">No matching labour-market alerts for the current profile.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {(market?.alerts || alerts).slice(0, 6).map((alert: any) => (
              <div key={`${alert.district}-${alert.trade}-${alert.alert_type}`} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-medium">{alert.trade || alert.name || 'Market alert'}</div>
                  <StatusBadge status={alert.alert_type || alert.status || 'Balanced'} />
                </div>
                <div className="text-sm text-slate-600">{alert.reason || 'Current labour demand is outpacing nearby training capacity.'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

