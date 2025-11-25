// src/pages/freelancer/FreelancerDashboard.tsx  ← OR SellerDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { 
  Calendar, Clock, MapPin, Phone, MessageCircle, 
  CheckCircle, XCircle, TrendingUp, Users, DollarSign, Star, Briefcase
} from 'lucide-react';

export default function FreelancerDashboard() {
  const { user, notify } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get('http://127.0.0.1:8000/api/bookings/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setBookings(data);
    } catch (err) {
      console.log("No bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (booking: any, status: 'confirmed' | 'rejected') => {
    try {
      const token = localStorage.getItem('access_token');
      const bookingId = booking.id || booking.pk || booking.booking_id;
      
      await axios.patch(`http://127.0.0.1:8000/api/bookings/${bookingId}/`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      notify(`Booking ${status}!`, "success");
      fetchBookings();
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <p className="text-white text-4xl font-bold animate-pulse">Loading...</p>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-6xl font-bold text-white text-center mb-12">
          Welcome, <span className="text-yellow-400">{user?.username}</span>
        </h1>

        {pendingBookings.length === 0 ? (
          <div className="text-center py-32">
            <Clock className="w-32 h-32 mx-auto text-gray-400 mb-8" />
            <p className="text-5xl text-gray-300 font-bold">No pending bookings</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pendingBookings.map((booking) => {
              const bookingId = booking.id || booking.pk || booking.booking_id || 0;
              
              return (
                <div key={bookingId} className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-4xl font-bold text-white">
                        {booking.customer_name || booking.customer?.username || 'Customer'}
                      </h3>
                      <p className="text-2xl text-cyan-400 mt-2">
                        {booking.service_title || booking.overview?.titleOverview || 'Service'}
                      </p>
                    </div>
                    <span className="bg-yellow-500 text-black px-8 py-4 rounded-full text-2xl font-bold">
                      PENDING
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-gray-300 mb-8">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-8 h-8 text-purple-400" />
                      <span className="text-xl">{booking.booking_date || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Clock className="w-8 h-8 text-blue-400" />
                      <span className="text-xl">{booking.booking_time?.slice(0,5) || 'Anytime'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Phone className="w-8 h-8 text-green-400" />
                      <span className="text-xl">{booking.customer_phone || 'Not provided'}</span>
                    </div>
                  </div>

                  {booking.message && (
                    <p className="text-lg text-gray-300 italic mb-8">"{booking.message}"</p>
                  )}

                  <div className="flex gap-6">
                    <button
                      onClick={() => updateBookingStatus(booking, 'confirmed')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold text-2xl py-6 rounded-3xl"
                    >
                      CONFIRM BOOKING
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking, 'rejected')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-2xl py-6 rounded-3xl"
                    >
                      REJECT BOOKING
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}