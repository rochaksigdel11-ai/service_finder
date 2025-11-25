// src/pages/freelancer/FreelancerDashboard.tsx - FIXED
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

  // In FreelancerDashboard.tsx - FIX THE API ENDPOINT
const fetchBookings = async () => {
  try {
    const token = localStorage.getItem('access_token');
    // ✅ CORRECT: Use seller bookings endpoint
    const res = await axios.get('http://127.0.0.1:8000/api/seller/bookings/', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Seller bookings API response:", res.data);
    const data = Array.isArray(res.data) ? res.data : [];
    setBookings(data);
  } catch (err: any) {
    console.error("Failed to fetch seller bookings:", err);
    notify('Failed to load bookings: ' + (err.response?.data?.error || 'Check console'), 'error');
    setBookings([]);
  } finally {
    setLoading(false);
  }
};

  const updateBookingStatus = async (bookingId: number, status: 'confirmed' | 'completed' | 'rejected') => {
    try {
      const token = localStorage.getItem('access_token');
      
      // ✅ Use the correct update endpoint (you might need to create this)
      await axios.post(`http://127.0.0.1:8000/api/bookings/${bookingId}/update_status/`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      notify(`Booking ${status}!`, "success");
      fetchBookings(); // Refresh the list
    } catch (err) {
      notify("Update failed - check console", "error");
      console.error("Status update error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <p className="text-white text-4xl font-bold animate-pulse">Loading your bookings...</p>
      </div>
    );
  }

  // Show all bookings, not just pending
  const allBookings = bookings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-6xl font-bold text-white text-center mb-12">
          Welcome, <span className="text-yellow-400">{user?.username}</span>
        </h1>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <Users className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
            <p className="text-3xl font-bold text-white">{allBookings.length}</p>
            <p className="text-gray-300">Total Bookings</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <Clock className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
            <p className="text-3xl font-bold text-white">
              {allBookings.filter(b => b.status === 'pending').length}
            </p>
            <p className="text-gray-300">Pending</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
            <p className="text-3xl font-bold text-white">
              {allBookings.filter(b => b.status === 'confirmed').length}
            </p>
            <p className="text-gray-300">Confirmed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <DollarSign className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold text-white">
              ₹{allBookings.reduce((sum, b) => sum + (b.price || 0), 0)}
            </p>
            <p className="text-gray-300">Total Value</p>
          </div>
        </div>

        {allBookings.length === 0 ? (
          <div className="text-center py-32 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
            <Briefcase className="w-32 h-32 mx-auto text-gray-400 mb-8" />
            <p className="text-5xl text-gray-300 font-bold mb-4">No bookings yet</p>
            <p className="text-2xl text-gray-400">When customers book your services, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {allBookings.map((booking) => {
              return (
                <div key={booking.id} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {booking.service}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {booking.customer_avatar}
                        </div>
                        <div>
                          <p className="text-xl text-white font-semibold">{booking.customer}</p>
                          <p className="text-lg text-cyan-400">Package: {booking.package}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-6 py-3 rounded-full text-xl font-bold ${
                      booking.status === 'pending' ? 'bg-yellow-500 text-black' :
                      booking.status === 'confirmed' ? 'bg-green-500 text-white' :
                      booking.status === 'completed' ? 'bg-blue-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 text-gray-300 mb-6">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-6 h-6 text-purple-400" />
                      <span className="text-lg">Date: {booking.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Clock className="w-6 h-6 text-blue-400" />
                      <span className="text-lg">Time: {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-6 h-6 text-green-400" />
                      <span className="text-lg">Amount: ₹{booking.price}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <MessageCircle className="w-6 h-6 text-cyan-400" />
                      <span className="text-lg">Message: {booking.message || 'No message'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 rounded-2xl transition-all"
                        >
                          CONFIRM BOOKING
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'rejected')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xl py-4 rounded-2xl transition-all"
                        >
                          REJECT BOOKING
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-4 rounded-2xl transition-all"
                      >
                        MARK AS COMPLETED
                      </button>
                    )}
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