export default function SettingsPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Application preferences and profile controls for the current SkillPlus session.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">Data source</div>
            <div className="mt-2 text-sm text-slate-600">Live labour-market dataset from the FastAPI backend.</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">Profile lock</div>
            <div className="mt-2 text-sm text-slate-600">Your onboarding profile is used to personalize the dashboard and filters.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
