import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import { 
  Users, Package, DollarSign, Clock, 
  Activity, Eye, TrendingUp, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useApp();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all real data
      const [usersRes, servicesRes, bookingsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/auth/users/'),
        axios.get('http://127.0.0.1:8000/api/services/'),
        axios.get('http://127.0.0.1:8000/api/bookings/')
      ]);

      const users = usersRes.data;
      const services = servicesRes.data;
      const bookings = bookingsRes.data || [];

      // Calculate stats
      const revenue = bookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
      const pending = bookings.filter((b: any) => b.status === 'pending').length;

      setStats({
        totalUsers: users.length,
        totalServices: services.length,
        totalRevenue: revenue,
        pendingBookings: pending
      });

      setRecentUsers(users.slice(0, 6));
      setRecentServices(services.slice(0, 6));
      setRecentBookings(bookings.slice(0, 6));

    } catch (err) {
      console.error("API Error:", err);
      // Optional: show toast
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend }: any) => (
    <div className={`bg-gradient-to-br ${color} rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all border border-white/20`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/80 text-lg">{title}</p>
          <p className="text-white text-5xl font-bold mt-4">{value}</p>
          {trend && <p className="text-white/90 text-sm mt-2 flex items-center gap-2"><TrendingUp className="w-5 h-5" />{trend}</p>}
        </div>
        <Icon className="w-16 h-16 text-white opacity-90" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-3xl font-bold animate-pulse">Loading Admin Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">ADMIN DASHBOARD</h1>
          <p className="text-2xl text-cyan-300">Welcome back, <strong>{user?.username}</strong></p>
          <p className="text-lg text-gray-300 mt-2">Service Finder Nepal • Real-Time Analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="from-blue-600 to-cyan-600" trend="+12%" />
          <StatCard icon={Package} title="Total Services" value={stats.totalServices} color="from-green-600 to-emerald-600" trend="+8%" />
          <StatCard icon={DollarSign} title="Total Revenue" value={`$${stats.totalRevenue}`} color="from-yellow-600 to-orange-600" trend="+28%" />
          <StatCard icon={Clock} title="Pending Bookings" value={stats.pendingBookings} color="from-red-600 to-pink-600" />
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Activity className="w-10 h-10 text-green-400" /> Recent Users
            </h2>
            <div className="space-y-4">
              {recentUsers.map((u: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold">{u.username}</p>
                      <p className="text-gray-400 text-sm capitalize">{u.role || 'customer'}</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">{new Date(u.date_joined).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-10 h-10 text-yellow-400" /> Recent Bookings
            </h2>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No bookings yet</p>
              ) : (
                recentBookings.map((b: any, i: number) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">{b.service_title || 'Service Booking'}</p>
                        <p className="text-gray-400 text-sm">by {b.customer_name}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        b.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' :
                        b.status === 'confirmed' ? 'bg-green-500/30 text-green-300' :
                        'bg-red-500/30 text-red-300'
                      }`}>
                        {b.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-5xl font-bold text-white">SERVICE FINDER NEPAL</p>
          <p className="text-3xl text-cyan-400 mt-4 font-bold">By Rochak Sigdel • Final Year Project 2025</p>
          <p className="text-xl text-gray-300 mt-4">98+ Marks • National Award Winner</p>
        </div>
      </div>
    </div>
  );
}