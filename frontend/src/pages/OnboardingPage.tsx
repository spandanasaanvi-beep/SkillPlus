import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../components/SearchableSelect';
import {
  getDistrictOptions,
  preferredJobOptions,
  preferredStateOptions,
  qualificationOptions,
  sectorOptions,
  skillOptions,
} from '../data/profileOptions';
import { getProfile, updateProfile } from '../services/api';

type ProfileForm = {
  name: string;
  qualification: string;
  skills: string[];
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
    skills: [],
    preferredJob: '',
    sector: '',
    state: '',
    district: '',
  });
  const districts = getDistrictOptions(profile.state);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      navigate('/dashboard');
      return;
    }
  }, [navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = { ...profile, name: profile.name.trim(), preferredJob: profile.preferredJob.trim() };

    if (!cleaned.name || !cleaned.qualification || cleaned.skills.length === 0 || !cleaned.preferredJob || !cleaned.sector || !cleaned.state || !cleaned.district) {
      setError('Please complete all onboarding fields before continuing.');
      return;
    }

    const payload = {
      name: cleaned.name,
      qualification: cleaned.qualification,
      skills: cleaned.skills,
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
                  <select
                    required
                    value={profile.qualification}
                    onChange={(event) => setProfile((current) => ({ ...current, qualification: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                  >
                    <option value="">Select your qualification</option>
                    {qualificationOptions.map((qualification) => <option key={qualification} value={qualification}>{qualification}</option>)}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Skills
                  <SearchableSelect
                    required
                    multiple
                    label="Skills"
                    options={skillOptions}
                    value={profile.skills}
                    onChange={(skills) => setProfile((current) => ({ ...current, skills }))}
                    placeholder="Select your skills"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Preferred Job / Occupation
                  <SearchableSelect
                    required
                    label="Preferred Job / Occupation"
                    options={preferredJobOptions}
                    value={profile.preferredJob}
                    onChange={(preferredJob) => setProfile((current) => ({ ...current, preferredJob }))}
                    placeholder="Select preferred job"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Preferred Sector
                  <select
                    required
                    value={profile.sector}
                    onChange={(event) => setProfile((current) => ({ ...current, sector: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500"
                  >
                    <option value="">Select your preferred sector</option>
                    {sectorOptions.map(({ label, value }) => (
                      <option key={value} value={value}>{label}</option>
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
                  >
                    <option value="">Select preferred state</option>
                    {preferredStateOptions.map((state) => (
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
                    disabled={!profile.state || districts.length === 0}
                  >
                    <option value="">Select preferred district</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </label>
              </div>

              {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

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
