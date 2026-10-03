const endpoints = [
  { method: 'GET', path: '/api/health', purpose: 'Health check for service availability.' },
  { method: 'GET', path: '/api/overview', purpose: 'National and filtered summary indicators.' },
  { method: 'GET', path: '/api/gaps', purpose: 'Demand-supply gap values by state, district, sector or trade.' },
  { method: 'GET', path: '/api/forecast', purpose: 'Historical and forecasted demand signals.' },
  { method: 'GET', path: '/api/alerts', purpose: 'Priority early-warning indicators.' },
  { method: 'GET', path: '/api/priorities', purpose: 'AI-generated planning priority ranking.' },
  { method: 'POST', path: '/api/data/upload', purpose: 'Upload and validate a CSV file.' },
  { method: 'GET', path: '/api/data/export', purpose: 'Download CSV export for planning use.' },
];

export default function ApiInfoPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">API / Integration Information</h1>
        <p className="text-slate-600">The API supports integration with future state and district planning workflows while keeping the prototype easy to extend.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 text-sm uppercase tracking-wide text-slate-500">Base API URL</div>
        <div className="rounded-lg bg-slate-100 p-3 font-mono text-sm text-slate-700">http://localhost:8000</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Method</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Endpoint</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((item) => (
              <tr key={`${item.method}-${item.path}`} className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm font-medium text-blue-700">{item.method}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700">{item.path}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
