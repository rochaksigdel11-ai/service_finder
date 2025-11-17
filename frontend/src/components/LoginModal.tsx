// frontend/src/pages/LoginModal.tsx
import React, { useState } from 'react';
import { Modal, Input, Button } from './ModalComponents';
import { User, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

// AUTO-ADD JWT TO ALL REQUESTS
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function LoginModal() {
  const { showLogin, setShowLogin, login, notify } = useApp();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. GET JWT TOKEN — CORRECT URL
      const tokenRes = await axios.post('/api/token/', {
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem('access_token', tokenRes.data.access);
      localStorage.setItem('refresh_token', tokenRes.data.refresh);

      // 2. LOGIN VIA CONTEXT (NO NEED FOR PROFILE API)
      await login(formData.username, formData.password);

      notify(`Welcome back, ${formData.username}!`, 'success');
      setShowLogin(false);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid username or password';
      notify(msg, 'error');
    }
  };

  return (
    <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Login to ServiceFinder">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          placeholder="Enter username"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          icon={<User className="w-5 h-5" />}
        />
        <Input
          type="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          icon={<Shield className="w-5 h-5" />}
        />
        <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
          Login Now
        </Button>
      </form>

      {/* DEMO CREDENTIALS */}
      <div className="mt-6 p-4 bg-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-white">Demo Accounts:</p>
        <p><strong>Admin:</strong> admin3 / admin123</p>
        <p><strong>Freelancer:</strong> raju / raju123</p>
        <p><strong>Customer:</strong> sita / sita123</p>
      </div>
    </Modal>
  );
}