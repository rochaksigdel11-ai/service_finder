// src/pages/LoginPage.tsx — FINAL BEAUTIFUL + 100% WORKING
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify, setUser } = useApp();

  const handleLogin = async () => {
    if (!username || !password) return notify('Enter username & password', 'error');

    setLoading(true);
    try {
      const tokenRes = await axios.post('http://127.0.0.1:8000/api/auth/token/', {
        username,
        password,
      });

      const accessToken = tokenRes.data.access;
      localStorage.setItem('access_token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const profileRes = await axios.get('http://127.0.0.1:8000/api/auth/profile/');

      const loggedInUser = {
        username: profileRes.data.username,
        role: profileRes.data.role,
        name: profileRes.data.full_name || profileRes.data.username,
      };

      setUser(loggedInUser);
      notify(`Namaste, ${loggedInUser.username}!`, 'success');

      const role = profileRes.data.role.toLowerCase();
      if (role === 'seller' || role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/services');
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Invalid username or password';
      notify(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 w-full max-w-lg shadow-2xl border border-white/20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-white mb-4 tracking-tight">
            ServiceFinder <span className="text-yellow-400">Nepal</span>
          </h1>
          <p className="text-2xl text-gray-200">Your trusted local service platform</p>
        </div>

        <div className="space-y-8">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-5 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-gray-300 text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-5 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-gray-300 text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition"
          />
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold text-2xl rounded-2xl hover:scale-105 transition transform disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Logging in...' : 'LOGIN & CONTINUE'}
          </button>
        </div>

        <div className="mt-12 p-8 bg-black/40 rounded-2xl border border-white/10">
          <p className="text-white font-bold text-center text-xl mb-6">Demo Accounts</p>
          <div className="grid grid-cols-1 gap-4 text-gray-200">
            <div className="bg-white/10 px-6 py-4 rounded-xl">
              <span className="font-semibold text-yellow-400">Customer →</span> sita / sita123
            </div>
            <div className="bg-white/10 px-6 py-4 rounded-xl">
              <span className="font-semibold text-cyan-400">Freelancer →</span> raju / raju123
            </div>
            <div className="bg-white/10 px-6 py-4 rounded-xl">
              <span className="font-semibold text-red-400">Admin →</span> admin / admin123
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 mt-8 text-sm">
          Made with ❤️ for Nepal's gig economy
        </p>
      </div>
    </div>
  );
}