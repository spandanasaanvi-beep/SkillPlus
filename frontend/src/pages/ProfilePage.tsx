import { useEffect, useState } from 'react';
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileForm>({
    name: '',
    qualification: '',
    skills: [],
    preferredJob: '',
    sector: '',
    state: '',
    district: '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const districts = getDistrictOptions(profile.state);

  const qualificationChoices = profile.qualification && !qualificationOptions.includes(profile.qualification)
    ? [profile.qualification, ...qualificationOptions]
    : qualificationOptions;
  const jobChoices = profile.preferredJob && !preferredJobOptions.includes(profile.preferredJob)
    ? [profile.preferredJob, ...preferredJobOptions]
    : preferredJobOptions;
  const sectorChoices = profile.sector && !sectorOptions.some(({ value }) => value === profile.sector)
    ? [{ label: profile.sector, value: profile.sector }, ...sectorOptions]
    : sectorOptions;

  useEffect(() => {
    const current = getProfile();
    if (current) {
      setProfile({
        name: current.name || '',
        qualification: current.qualification || '',
        skills: Array.isArray(current.skills) ? current.skills : [],
        preferredJob: current.preferredJob || '',
        sector: current.sector || '',
        state: current.state || '',
        district: current.district || '',
      });
    }
  }, []);

  const handleSave = () => {
    const cleaned = {
      name: profile.name.trim(),
      qualification: profile.qualification,
      skills: profile.skills,
      preferredJob: profile.preferredJob,
      sector: profile.sector,
      state: profile.state,
      district: profile.district,
    };

    if (!cleaned.name || !cleaned.qualification || !cleaned.preferredJob || !cleaned.sector || !cleaned.state || !cleaned.district || cleaned.skills.length === 0) {
      setError('Please complete all profile fields before saving.');
      return;
    }

    updateProfile(cleaned);
    setError('');
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
            <input required value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Qualification
            <select required value={profile.qualification} onChange={(event) => setProfile((current) => ({ ...current, qualification: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5">
              <option value="">Select your qualification</option>
              {qualificationChoices.map((qualification) => <option key={qualification} value={qualification}>{qualification}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Skills
            <SearchableSelect required multiple label="Skills" options={skillOptions} value={profile.skills} onChange={(skills) => setProfile((current) => ({ ...current, skills }))} placeholder="Select your skills" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Preferred job
            <SearchableSelect required label="Preferred job" options={jobChoices} value={profile.preferredJob} onChange={(preferredJob) => setProfile((current) => ({ ...current, preferredJob }))} placeholder="Select preferred job" />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Sector
            <select required value={profile.sector} onChange={(event) => setProfile((current) => ({ ...current, sector: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5">
              <option value="">Select preferred sector</option>
              {sectorChoices.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            State
            <select required value={profile.state} onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value, district: '' }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5">
              <option value="">Select preferred state</option>
              {preferredStateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            District
            <select required value={profile.district} onChange={(event) => setProfile((current) => ({ ...current, district: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" disabled={!profile.state || districts.length === 0}>
              <option value="">Select preferred district</option>
              {profile.district && !districts.includes(profile.district) && <option value={profile.district}>{profile.district}</option>}
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </label>
        </div>

        {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-emerald-600">Profile saved.</span>}
          <button type="button" onClick={handleSave} className="rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-500">Save profile</button>
        </div>
      </div>
    </div>
  );
}
