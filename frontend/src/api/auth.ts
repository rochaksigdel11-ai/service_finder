import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export const login = async (username: string, password: string) => {
  const res = await axios.post(`${API_BASE}/token/`, { username, password });
  return res.data;
};

export const getProfile = async () => {
  const res = await axios.get(`${API_BASE}/profile/`);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  axios.defaults.headers.common['Authorization'] = '';
};