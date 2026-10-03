import { useEffect, useState } from 'react';
import { getMethodology } from '../services/api';

export default function MethodologyPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getMethodology().then(setData);
  }, []);

  if (!data) return <div className="py-10 text-center">Loading methodology…</div>;

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Methodology</h1>
        <p className="text-slate-600">The pipeline converts raw labour-market signals into explainable indicators and forecasts.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-xl font-semibold">{data.title}</div>
        <div className="space-y-4">
          {data.sections.map((section: any) => (
            <div key={section.source} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-lg font-semibold text-slate-800">{section.source}</div>
              <div className="text-sm text-slate-600">{section.process}</div>
              <div className="mt-2 rounded-lg bg-white p-3 text-sm"><span className="font-medium">Formula:</span> {section.formula}</div>
              <div className="mt-2 text-sm text-slate-600">{section.interpretation}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-lg font-semibold">Pipeline</div>
        <div className="flex flex-wrap gap-2 text-sm text-slate-700">
          {['Data Sources', 'Data Normalisation', 'Demand Signals', 'Supply Signals', 'Demand Index', 'Supply Index', 'Gap Analysis', 'Forecasting', 'Early Warnings', 'Planner Dashboard'].map((step) => (
            <span key={step} className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
