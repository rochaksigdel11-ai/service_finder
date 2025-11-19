import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { Shield, Users, Package, Ban } from 'lucide-react';

export default function AdminDashboard() {
  const { notify } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const usersRes = await axios.get('/api/auth/users/');        // ← FIXED
      const bookRes = await axios.get('/api/bookings/all/');       // ← FIXED
      setUsers(usersRes.data);
      setBookings(bookRes.data);
    } catch (err) {
      notify('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (id: number) => {
    if (confirm('Block this user?')) {
      try {
        await axios.patch(`/api/auth/users/${id}/`, { is_active: false });
        notify('User blocked', 'success');
        fetchAllData();
      } catch (err) {
        notify('Failed to block user', 'error');
      }
    }
  };

  if (loading) return <div className="text-white text-center py-32 text-3xl">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Shield className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
          <h1 className="text-6xl font-bold text-white">ADMIN PANEL</h1>
          <p className="text-2xl text-gray-300">Full Control Center</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ALL USERS */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
              <Users className="w-10 h-10" /> All Users ({users.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <div key={u.id} className="bg-white/5 rounded-2xl p-6 flex justify-between items-center flex">
                  <div>
                    <p className="text-xl font-bold text-white">{u.username}</p>
                    <p className="text-gray-300">{u.role} • {u.email || 'No email'}</p>
                  </div>
                  <button
                    onClick={() => blockUser(u.id)}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2"
                  >
                    <Ban className="w-5 h-5" /> Block
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ALL BOOKINGS */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
              <Package className="w-10 h-10" /> All Bookings ({bookings.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white/5 rounded-2xl p-6">
                  <p className="text-white font-bold text-lg">{b.service_title}</p>
                  <p className="text-gray-300">{b.customer_name} → {b.seller_name || 'Unknown Seller'}</p>
                  <p className="text-sm text-gray-400">Status: <span className="font-bold">{b.status.toUpperCase()}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}