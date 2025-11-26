// src/pages/BookingDetailPage.tsx — FINAL & PERFECT
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Package, MessageSquare } from 'lucide-react';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/bookings/${id}/`);
        setBooking(res.data);
      } catch (err) {
        alert("Booking not found or access denied");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();

    // Real-time refresh every 10 seconds
    const interval = setInterval(fetchBooking, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-3xl">Loading booking...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">Booking not found</div>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return 'bg-green-500/20 text-green-300 border border-green-500/50';
    if (s === 'pending') return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50';
    if (s === 'rejected') return 'bg-red-500/20 text-red-300 border border-red-500/50';
    if (s === 'completed') return 'bg-blue-500/20 text-blue-300 border border-blue-500/50';
    return 'bg-gray-500/20 text-gray-300 border border-gray-500/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* FIXED: Back to My Bookings */}
        <Link to="/my-bookings" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 text-lg">
          <ArrowLeft className="w-6 h-6" /> Back to My Bookings
        </Link>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-5xl font-bold text-white mb-3">Booking #{booking.id}</h1>
              <p className="text-2xl text-cyan-300 font-semibold">{booking.service__titleOverview}</p>
            </div>

            <div className={`px-10 py-5 rounded-2xl text-2xl font-bold ${getStatusStyle(booking.status)}`}>
              {booking.status?.toUpperCase() || 'UNKNOWN'}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 text-white mb-10">
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-cyan-500/20 rounded-2xl">
                  <Package className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-lg">Package Selected</p>
                  <p className="text-2xl font-bold">{booking.package_type || 'Standard'}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-4 bg-green-500/20 rounded-2xl">
                  <User className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-lg">Freelancer</p>
                  <p className="text-2xl font-bold">{booking.freelancer__username}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-yellow-500/20 rounded-2xl">
                  <Clock className="w-10 h-10 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-lg">Preferred Date</p>
                  <p className="text-2xl font-bold">
                    {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-5xl font-bold text-green-400">Rs.</div>
                <div>
                  <p className="text-gray-400 text-lg">Total Amount</p>
                  <p className="text-4xl font-bold text-green-400">
                    {Number(booking.total_amount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {booking.message && (
            <div className="mt-10 p-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-8 h-8 text-cyan-400" />
                <p className="text-xl text-gray-300">Your Message to Freelancer:</p>
              </div>
              <p className="text-xl text-white italic leading-relaxed">"{booking.message}"</p>
            </div>
          )}

          <div className="mt-12 text-center">
            {booking.status === 'pending' && (
              <p className="text-2xl text-yellow-300 flex items-center justify-center gap-3">
                <Clock className="w-10 h-10 animate-spin" /> Waiting for freelancer to confirm...
              </p>
            )}
            {booking.status === 'confirmed' && (
              <p className="text-2xl text-green-300 flex items-center justify-center gap-4">
                <CheckCircle className="w-12 h-12" /> Booking Confirmed!
              </p>
            )}
            {booking.status === 'rejected' && (
              <p className="text-2xl text-red-300 flex items-center justify-center gap-4">
                <XCircle className="w-12 h-12" /> Booking Rejected
              </p>
            )}
          </div>
        </div>

        <div className="text-center mt-16 text-gray-400">
          <p className="text-lg">Need help? Contact support@servicefinder.com.np</p>
        </div>
      </div>
    </div>
  );
}