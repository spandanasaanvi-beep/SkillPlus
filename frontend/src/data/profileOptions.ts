import { getAllStates, getDistricts } from 'india-state-district';

export const qualificationOptions = [
  '10th / SSLC',
  '12th / PUC',
  'ITI',
  'Diploma',
  "Undergraduate / Bachelor's",
  "Postgraduate / Master's",
  'PhD',
  'Other',
];

export const skillOptions = [
  'Programming',
  'Web Development',
  'Data Analysis',
  'AI / ML',
  'Cloud Computing',
  'Cybersecurity',
  'UI/UX',
  'Communication',
  'Digital Marketing',
  'Project Management',
  'Database Management',
  'Networking',
  'Problem Solving',
  'Other',
];

export const preferredJobOptions = [
  'Software Developer',
  'Data Analyst',
  'Business Analyst',
  'Web Developer',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'UI/UX Designer',
  'Cloud / DevOps Engineer',
  'QA / Tester',
  'Technical Support',
  'Digital Marketing',
  'Product Management',
  'Project Management',
  'Business / Management',
  'Other',
];

export const sectorOptions = [
  { label: 'IT & Software', value: 'IT/ITeS' },
  { label: 'Banking & Finance', value: 'Banking & Finance' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Education', value: 'Education' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Government', value: 'Government' },
  { label: 'E-commerce', value: 'E-commerce' },
  { label: 'Telecommunications', value: 'Telecommunications' },
  { label: 'Media & Entertainment', value: 'Media & Entertainment' },
  { label: 'Consulting', value: 'Consulting' },
  { label: 'Other', value: 'Other' },
];

const stateNameOverrides: Record<string, string> = {
  AN: 'Andaman and Nicobar Islands',
  DH: 'Dadra and Nagar Haveli and Daman and Diu',
  DL: 'Delhi',
  PY: 'Puducherry',
};

const stateDistrictNameOverrides: Record<string, Record<string, string>> = {
  KA: {
    Bellary: 'Ballari',
    Belgaum: 'Belagavi',
    'Bangalore Rural': 'Bengaluru Rural',
    'Bangalore Urban': 'Bengaluru Urban',
    Chamarajanagara: 'Chamarajanagar',
    Chikmagalur: 'Chikkamagaluru',
    Gulbarga: 'Kalaburagi',
    Mysore: 'Mysuru',
    Shimoga: 'Shivamogga',
  },
  MH: {
    Ahmednagar: 'Ahilyanagar',
    Aurangabad: 'Chhatrapati Sambhajinagar',
    'Mumbai suburban': 'Mumbai Suburban',
    Osmanabad: 'Dharashiv',
  },
};

const states = getAllStates().map(({ code, name }) => ({
  code,
  name: stateNameOverrides[code] || name,
}));

export const preferredStateOptions = states
  .map(({ name }) => name)
  .sort((first, second) => first.localeCompare(second));

export function getDistrictOptions(stateName: string): string[] {
  const state = states.find(({ name }) => name === stateName);
  if (!state) return [];

  return getDistricts(state.code)
    .map((district) => stateDistrictNameOverrides[state.code]?.[district] || district)
    .sort((first, second) => first.localeCompare(second));
}