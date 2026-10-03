type FilterBarProps = {
  filters: {
    state?: string;
    district?: string;
    sector?: string;
    trade?: string;
    occupation?: string;
    skill?: string;
    qualification?: string;
    year?: number;
  };
  onChange: (key: string, value: string | number | undefined) => void;
  options: {
    states: string[];
    districts: string[];
    sectors: string[];
    trades: string[];
    years: number[];
    occupations?: string[];
    skills?: string[];
    qualifications?: string[];
  };
};

export default function FilterBar({ filters, onChange, options }: FilterBarProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-6">
      <label className="text-sm font-medium text-slate-700">
        Qualification
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          value={filters.qualification ?? ''}
          onChange={(e) => onChange('qualification', e.target.value || undefined)}
          placeholder="BE CSE / AIML"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Skill
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          value={filters.skill ?? ''}
          onChange={(e) => onChange('skill', e.target.value || undefined)}
          placeholder="Python"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Occupation
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          value={filters.occupation ?? ''}
          onChange={(e) => onChange('occupation', e.target.value || undefined)}
          placeholder="AI Engineer"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Sector
        <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.sector ?? ''} onChange={(e) => onChange('sector', e.target.value || undefined)}>
          <option value="">All sectors</option>
          {options.sectors.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">
        State
        <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.state ?? ''} onChange={(e) => onChange('state', e.target.value || undefined)}>
          <option value="">All states</option>
          {options.states.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">
        District
        <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.district ?? ''} onChange={(e) => onChange('district', e.target.value || undefined)}>
          <option value="">All districts</option>
          {options.districts.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700 md:col-span-3 xl:col-span-1">
        Year
        <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={filters.year ?? ''} onChange={(e) => onChange('year', e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">All years</option>
          {options.years.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
