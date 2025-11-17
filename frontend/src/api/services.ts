// frontend/src/api/services.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/api/',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNearbyServices = (lat: number, lng: number, radius = 5) => {
  return API.get(`nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
};