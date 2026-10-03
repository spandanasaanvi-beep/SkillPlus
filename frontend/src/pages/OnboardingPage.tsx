import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDistricts, getProfile, getSectors, getStates, getTrades, updateProfile } from '../services/api';

type ProfileForm = {
  name: string;
  qualification: string;
  skills: string;
  preferredJob: string;
  sector: string;
  state: string;
  district: string;
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileForm>({
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
  const [trades, setTrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      navigate('/dashboard');
      return;
    }

    Promise.all([getStates(), getSectors(), getTrades()]).then(([stateList, sectorList, tradeList]) => {
      setStates(stateList);
      setSectors(sectorList);
      setTrades(tradeList);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (!profile.state) {
      setDistricts([]);
      return;
    }

    getDistricts(profile.state).then((stateDistricts) => {
      setDistricts(stateDistricts);
      if (profile.district && !stateDistricts.includes(profile.district)) {
        setProfile((current) => ({ ...current, district: '' }));
      }
    }).catch(() => setDistricts([]));
  }, [profile.state]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = { ...profile, name: profile.name.trim(), preferredJob: profile.preferredJob.trim(), skills: profile.skills.trim() };

    if (!cleaned.name || !cleaned.qualification || !cleaned.skills || !cleaned.preferredJob || !cleaned.sector || !cleaned.state || !cleaned.district) {
      setError('Please complete all onboarding fields before continuing.');
      return;
    }

    const payload = {
      name: cleaned.name,
      qualification: cleaned.qualification,
      skills: cleaned.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      preferredJob: cleaned.preferredJob,
      sector: cleaned.sector,
      state: cleaned.state,
      district: cleaned.district,
    };

    updateProfile(payload);
    setError('');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 md:px-6">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                  Full Name
                  <input
                    required
                    value={profile.name}
                    onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Enter your full name"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Qualification
                  <input
                    required
                    value={profile.qualification}
                    onChange={(event) => setProfile((current) => ({ ...current, qualification: event.target.value }))}
                    placeholder="Select your qualification"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Skills
                  <input
                    required
                    value={profile.skills}
                    onChange={(event) => setProfile((current) => ({ ...current, skills: event.target.value }))}
                    placeholder="Enter your skills"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Preferred Job / Occupation
                  <input
                    required
                    value={profile.preferredJob}
                    onChange={(event) => setProfile((current) => ({ ...current, preferredJob: event.target.value }))}
                    placeholder="Select your preferred occupation"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Preferred Sector
                  <select
                    required
                    value={profile.sector}
                    onChange={(event) => setProfile((current) => ({ ...current, sector: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                    disabled={loading || sectors.length === 0}
                  >
                    <option value="">Select your preferred sector</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Preferred State
                  <select
                    required
                    value={profile.state}
                    onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value, district: '' }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                    disabled={loading || states.length === 0}
                  >
                    <option value="">Select your state</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                  Preferred District
                  <select
                    required
                    value={profile.district}
                    onChange={(event) => setProfile((current) => ({ ...current, district: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                    disabled={loading || districts.length === 0}
                  >
                    <option value="">Select your district</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </label>
              </div>

              {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-500"
                >
                  Continue to SkillPlus
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
      </div>
    </div>
  );
}
