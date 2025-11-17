
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Calendar, Briefcase, Settings } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useApp();

  const handleLogin = async () => {
    if (!username || !password) return notify('Enter username & password', 'error');

    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password,
      });
      localStorage.setItem('access_token', res.data.access);

      // FETCH PROFILE & REDIRECT
      const profileRes = await axios.get('http://127.0.0.1:8000/api/profile/');
      const role = profileRes.data.role;

      // REDIRECT BY ROLE
      if (role === 'buyer') navigate('/buyer/dashboard');
      else if (role === 'seller') navigate('/seller/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');

      notify(`Welcome, ${username}!`, 'success');
    } catch (err: any) {
      notify(err.response?.data?.detail || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Servify Nepal</h1>
          <p className="text-gray-300">Login to your account</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400">
          <p>Demo Accounts:</p>
          <p>Customer: sita / sita123</p>
          <p>Freelancer: raju / raju123</p>
          <p>Admin: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}