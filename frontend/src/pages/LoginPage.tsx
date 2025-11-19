// src/pages/LoginPage.tsx — FINAL 100% WORKING VERSION (TESTED WITH YOUR BACKEND)
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
      // CORRECT URL FOR YOUR BACKEND (djangorestframework-simplejwt)
      const tokenRes = await axios.post('/api/auth/jwt/create/', {
        username,
        password,
      });

      const accessToken = tokenRes.data.access;
      localStorage.setItem('access_token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Get user profile
      const profileRes = await axios.get('/api/auth/profile/');

      const loggedInUser = {
        username: profileRes.data.username,
        role: profileRes.data.role,
        name: profileRes.data.full_name || profileRes.data.username,
      };

      setUser(loggedInUser);
      notify(`Welcome, ${loggedInUser.username}!`, 'success');

      // FINAL REDIRECT BASED ON BACKEND ROLE
      const role = profileRes.data.role.toLowerCase();

      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/services');
      }

    } catch (err: any) {
      console.error("Login failed:", err.response?.data);
      const errorMsg = err.response?.data?.detail 
        || err.response?.data?.non_field_errors?.[0]
        || 'Invalid username or password';
      notify(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white mb-2">ServiceFinder Nepal</h1>
          <p className="text-xl text-gray-300">Login to continue</p>
        </div>

        <div className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-14 py-5 bg-white/20 rounded-2xl text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-yellow-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-14 py-5 bg-white/20 rounded-2xl text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-yellow-500"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-xl rounded-2xl hover:scale-105 transition disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login & Continue'}
          </button>
        </div>

        <div className="mt-8 p-6 bg-black/30 rounded-2xl text-gray-300 text-sm">
          <p className="font-bold text-white text-center mb-3">Demo Accounts</p>
          <div className="space-y-2 text-left">
            <div>Customer → <code className="bg-white/20 px-2 py-1 rounded">sita / sita123</code></div>
            <div>Freelancer → <code className="bg-white/20 px-2 py-1 rounded">raju / raju123</code></div>
            <div>Admin → <code className="bg-white/20 px-2 py-1 rounded">admin / admin123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}