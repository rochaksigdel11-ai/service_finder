import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import { Check, X, Clock, User, Phone, MessageCircle } from 'lucide-react';

export default function SellerDashboard() {
  const { user, notify } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings/');
      setBookings(res.data);
    } catch (err) {
      notify('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'confirmed' | 'rejected') => {
    try {
      await axios.patch(`/api/bookings/${id}/`, { status });
      notify(`Booking ${status}!`, 'success');
      fetchBookings();
    } catch (err) {
      notify('Failed to update', 'error');
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading your bookings...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 py-12">
      <div className="container mx-auto px-6">
<h1 className="text-5xl font-bold text-white mb-4">
  Welcome back, {user?.username || 'Freelancer'}!
</h1>
        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <div className="text-center py-20 bg-white/10 rounded-3xl">
              <Clock className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <p className="text-2xl text-gray-300">No bookings yet. Share your profile!</p>
            </div>
          ) : (
            bookings.map((booking: any) => (
              <div key={booking.id} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{booking.service_title}</h3>
                    <p className="text-gray-300">Package: {booking.package_type}</p>
                  </div>
                  <span className={`px-6 py-3 rounded-full text-lg font-bold ${
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8 text-gray-300">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-cyan-400" />
                    <div>
                      <p className="text-sm text-gray-400">Customer</p>
                      <p className="font-bold text-white">{booking.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-bold text-white">{booking.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Message</p>
                      <p className="text-white">{booking.message || 'No message'}</p>
                    </div>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateStatus(booking.id, 'confirmed')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3"
                    >
                      <Check className="w-6 h-6" /> Confirm Booking
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, 'rejected')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3"
                    >
                      <X className="w-6 h-6" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}