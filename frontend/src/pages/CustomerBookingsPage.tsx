// src/pages/CustomerBookingsPage.tsx — FINAL REAL BOOKINGS + REAL-TIME
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Booking {
  id: number;
  service: string;
  provider: string;
  date: string;
  amount: number;
  status: string;
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRealBookings = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('access_token');
      
      const res = await axios.get('http://127.0.0.1:8000/api/orders/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load real bookings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealBookings();
    
    // REAL-TIME UPDATE EVERY 8 SECONDS
    const interval = setInterval(fetchRealBookings, 8000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'confirmed') {
      return <div className="flex items-center gap-3 bg-green-500/20 text-green-300 px-8 py-4 rounded-full font-bold text-xl border-2 border-green-500/50 shadow-lg shadow-green-500/20"><CheckCircle className="w-8 h-8" /> CONFIRMED</div>;
    }
    if (s === 'rejected') {
      return <div className="flex items-center gap-3 bg-red-500/20 text-red-300 px-8 py-4 rounded-full font-bold text-xl border-2 border-red-500/50 shadow-lg shadow-red-500/20"><XCircle className="w-8 h-8" /> REJECTED</div>;
    }
    return <div className="flex items-center gap-3 bg-yellow-500/20 text-yellow-300 px-8 py-4 rounded-full font-bold text-xl border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20"><Clock className="w-8 h-8 animate-spin" /> PENDING</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <p className="text-white text-4xl font-bold animate-pulse">Loading Your Real Bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-6">My Booking History</h1>
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-full px-8 py-4 border border-white/20">
            <RefreshCw className={`w-6 h-6 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <p className="text-xl text-cyan-300">Real-Time Updates • Every 8 Seconds</p>
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-40 h-40 text-gray-600 mx-auto mb-10 opacity-50" />
            <p className="text-4xl text-gray-400 mb-8">No bookings found</p>
            <Link to="/services" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-12 py-6 rounded-full text-2xl font-bold shadow-2xl transform hover:scale-110 transition-all">
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                to={`/booking/${booking.id}`}
                className="block bg-white/10 backdrop-blur-2xl rounded-3xl p-10 hover:bg-white/20 transition-all border-2 border-white/20 hover:border-cyan-500/70 shadow-2xl hover:shadow-cyan-500/30 transform hover:scale-[1.02] duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-4xl font-bold text-white mb-4">{booking.service}</h3>
                    <p className="text-2xl text-cyan-300 mb-6">Provider: <span className="font-bold">{booking.provider}</span></p>
                    <div className="flex flex-wrap items-center gap-8 text-gray-300 text-lg">
                      <span className="flex items-center gap-3">
                        <Clock className="w-6 h-6" />
                        {new Date(booking.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-3xl font-bold text-green-400">Rs. {booking.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-6">
                    {getStatusBadge(booking.status)}
                    <p className="text-gray-400 text-lg flex items-center gap-3">
                      Click for details →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Live Indicator */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-full px-10 py-5 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/30">
            <div className="w-5 h-5 bg-green-400 rounded-full animate-ping"></div>
            <div className="w-5 h-5 bg-green-400 rounded-full absolute animate-ping"></div>
            <p className="text-2xl font-bold text-white">LIVE • CONNECTED • REAL-TIME</p>
          </div>
        </div>
      </div>
    </div>
  );
}