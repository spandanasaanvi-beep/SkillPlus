import { useEffect, useState } from 'react';
import { getDistricts, getProfile, getSectors, getStates, updateProfile } from '../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    qualification: '',
    skills: '',
    preferredJob: '',
    sector: '',
    state: '',
    district: '',
  });
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getProfile();
    if (current) {
      setProfile({
        name: current.name || '',
        qualification: current.qualification || '',
        skills: Array.isArray(current.skills) ? current.skills.join(', ') : '',
        preferredJob: current.preferredJob || '',
        sector: current.sector || '',
        state: current.state || '',
        district: current.district || '',
      });
    }

    Promise.all([getStates(), getSectors()]).then(([stateList, sectorList]) => {
      setStates(stateList);
      setSectors(sectorList);
    });
  }, []);

  useEffect(() => {
    if (!profile.state) {
      setDistricts([]);
      return;
    }

    getDistricts(profile.state).then((list) => {
      setDistricts(list);
      if (profile.district && !list.includes(profile.district)) {
        setProfile((current) => ({ ...current, district: '' }));
      }
    });
  }, [profile.state]);

  const handleSave = () => {
    const cleaned = {
      name: profile.name.trim(),
      qualification: profile.qualification.trim(),
      skills: profile.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      preferredJob: profile.preferredJob.trim(),
      sector: profile.sector,
      state: profile.state,
      district: profile.district,
    };

    if (!cleaned.name || !cleaned.qualification || !cleaned.preferredJob || !cleaned.state || !cleaned.district || cleaned.skills.length === 0) {
      return;
    }

    updateProfile(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600">Update your career profile so recommendations stay aligned with your current goals.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Full name
            <input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Qualification
            <input value={profile.qualification} onChange={(event) => setProfile((current) => ({ ...current, qualification: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Skills
            <input value={profile.skills} onChange={(event) => setProfile((current) => ({ ...current, skills: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Preferred job
            <input value={profile.preferredJob} onChange={(event) => setProfile((current) => ({ ...current, preferredJob: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Sector
            <select value={profile.sector} onChange={(event) => setProfile((current) => ({ ...current, sector: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5">
              <option value="">Select sector</option>
              {sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            State
            <select value={profile.state} onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5">
              <option value="">Select state</option>
              {states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            District
            <select value={profile.district} onChange={(event) => setProfile((current) => ({ ...current, district: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5">
              <option value="">Select district</option>
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-emerald-600">Profile saved.</span>}
          <button type="button" onClick={handleSave} className="rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-500">Save profile</button>
        </div>
      </div>
    </div>
  );
}
