import { ChangeEvent, useState } from 'react';
import { uploadCsv } from '../services/api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await uploadCsv(file);
      setResponse(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Upload failed. Check your CSV structure and try again.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Data Upload</h1>
        <p className="text-slate-600">Upload a planner CSV to normalize labour and training data for instant indicator calculation.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-4 block text-sm font-medium text-slate-700">Upload CSV</label>
        <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full rounded-xl border border-slate-300 p-3" />
        <button type="button" onClick={handleUpload} className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:bg-slate-400" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload and process'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {response && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Processed data summary</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Inserted</div><div className="text-2xl font-bold">{response.inserted}</div></div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Skipped</div><div className="text-2xl font-bold">{response.skipped}</div></div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="text-sm text-slate-500">Warnings</div><div className="text-2xl font-bold">{response.warnings?.length ?? 0}</div></div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2">Trade</th>
                  <th className="px-3 py-2">Sector</th>
                  <th className="px-3 py-2">Demand</th>
                  <th className="px-3 py-2">Supply</th>
                  <th className="px-3 py-2">Gap</th>
                </tr>
              </thead>
              <tbody>
                {response.sample_rows?.map((row: any) => (
                  <tr key={`${row.trade}-${row.district}`} className="border-t border-slate-200">
                    <td className="px-3 py-2">{row.trade}</td>
                    <td className="px-3 py-2">{row.sector}</td>
                    <td className="px-3 py-2">{row.demand_index}</td>
                    <td className="px-3 py-2">{row.supply_index}</td>
                    <td className="px-3 py-2">{row.gap_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
