import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PROFILE_STORAGE_KEY = 'skillplus-profile';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch {
    return { status: 'offline', service: 'SkillPlus API' };
  }
};

export const getProfile = () => {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
};

export const updateProfile = (profile: Record<string, unknown>) => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
};

export const clearProfile = () => localStorage.removeItem(PROFILE_STORAGE_KEY);

export const getOverview = async (filters = {}) => {
  const response = await api.get('/api/overview', { params: filters });
  return response.data;
};

export const getLabourMarket = async (filters = {}) => {
  const response = await api.get('/api/labour-market', { params: filters });
  return response.data;
};

export const getDashboardData = async (filters = {}) => {
  const response = await api.get('/api/labour-market', { params: filters });
  return response.data;
};

export const getDemandSupply = async (filters = {}) => (await api.get('/api/gaps', { params: filters })).data;
export const getDemandTrend = async (filters = {}) => (await api.get('/api/forecast', { params: filters })).data;
export const getStateLabourData = async (filters = {}) => (await api.get('/api/labour-market', { params: filters })).data;
export const getOverallData = async (filters = {}) => (await api.get('/api/gaps', { params: filters })).data;

export const getStates = async () => (await api.get('/api/states')).data;
export const getDistricts = async (state?: string) => (await api.get('/api/districts', { params: state ? { state } : {} })).data;
export const getSectors = async () => (await api.get('/api/sectors')).data;
export const getTrades = async () => (await api.get('/api/trades')).data;
export const getGaps = async (filters = {}) => (await api.get('/api/gaps', { params: filters })).data;
export const getForecast = async (filters = {}) => (await api.get('/api/forecast', { params: filters })).data;
export const getAlerts = async (filters = {}) => (await api.get('/api/alerts', { params: filters })).data;
export const getPriorities = async (filters = {}) => (await api.get('/api/priorities', { params: filters })).data;
export const getMethodology = async () => (await api.get('/api/methodology')).data;
export const uploadCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/data/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const exportCsv = async (filters = {}) => {
  const response = await api.get('/api/data/export', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
};

export default api;
