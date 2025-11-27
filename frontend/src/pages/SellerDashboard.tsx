// src/pages/SellerDashboard.tsx - UPDATED WITH CORRECT ENDPOINT
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Clock, CheckCircle, XCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Booking {
  id: number;
  customer: string;
  customer_avatar: string;
  service: string;
  package: string;
  price: number;
  date: string;
  time: string;
  status: string;
  message: string;
}

export default function SellerDashboard() {
  const { user, notify } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('access_token');
      
      console.log('🔍 Fetching seller bookings from:', 'http://127.0.0.1:8000/api/seller/bookings/');
      
      const response = await axios.get('http://127.0.0.1:8000/api/seller/bookings/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Bookings data received:', response.data);
      setBookings(response.data);
      
    } catch (error: any) {
      console.error('❌ Failed to fetch seller bookings:', error);
      
      if (error.response) {
        console.log('Error response:', error.response);
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        
        if (error.response.status === 404) {
          notify('API endpoint not found. Please check backend.', 'error');
        } else if (error.response.status === 403) {
          notify('Access denied. Only freelancers can view bookings.', 'error');
        } else if (error.response.status === 500) {
          notify('Server error. Please check Django console.', 'error');
        } else {
          notify(`Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`, 'error');
        }
      } else if (error.request) {
        console.log('Error request:', error.request);
        notify('Network error. Cannot connect to server.', 'error');
      } else {
        notify('Unexpected error occurred.', 'error');
      }
      
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/bookings/${bookingId}/update_status/`,
        { status: newStatus },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      notify(`Booking ${newStatus} successfully!`, 'success');
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
    } catch (error: any) {
      console.error('Failed to update booking status:', error);
      
      if (error.response?.data?.error) {
        notify(`Failed: ${error.response.data.error}`, 'error');
      } else {
        notify('Failed to update booking status', 'error');
      }
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmed' || statusLower === 'completed') {
      return (
        <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full font-bold border-2 border-green-500/50">
          <CheckCircle className="w-5 h-5" />
          {status.toUpperCase()}
        </div>
      );
    }
    if (statusLower === 'rejected' || statusLower === 'cancelled') {
      return (
        <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full font-bold border-2 border-red-500/50">
          <XCircle className="w-5 h-5" />
          {status.toUpperCase()}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full font-bold border-2 border-yellow-500/50">
        <Clock className="w-5 h-5" />
        PENDING
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-2xl">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-6">Freelancer Dashboard</h1>
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-full px-8 py-4 border border-white/20">
            <RefreshCw className={`w-6 h-6 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            <p className="text-xl text-cyan-300">Real-Time Updates • Every 30 Seconds</p>
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <p className="text-4xl font-bold text-white">{bookings.length}</p>
            <p className="text-gray-300">Total Bookings</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <p className="text-4xl font-bold text-yellow-400">
              {bookings.filter(b => b.status.toLowerCase() === 'pending').length}
            </p>
            <p className="text-gray-300">Pending</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <p className="text-4xl font-bold text-green-400">
              {bookings.filter(b => b.status.toLowerCase() === 'confirmed').length}
            </p>
            <p className="text-gray-300">Confirmed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
            <p className="text-4xl font-bold text-blue-400">
              {bookings.reduce((total, booking) => total + booking.price, 0).toLocaleString()}
            </p>
            <p className="text-gray-300">Total Revenue (₹)</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-40 h-40 text-gray-600 mx-auto mb-10 opacity-50" />
            <p className="text-4xl text-gray-400 mb-8">No bookings yet</p>
            <p className="text-2xl text-gray-500 mb-12">When customers book your services, they'll appear here</p>
            <Link 
              to="/services" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-12 py-6 rounded-full text-2xl font-bold shadow-2xl transform hover:scale-110 transition-all"
            >
              Manage Your Services
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border-2 border-white/20 hover:border-cyan-500/70 shadow-2xl hover:shadow-cyan-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 border-white/50">
                        {booking.customer_avatar}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-white">{booking.customer}</h3>
                        <p className="text-xl text-cyan-300">Booked: {booking.service}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-3">
                        <p className="text-gray-300 text-lg">
                          <span className="font-semibold text-white">Package:</span> {booking.package}
                        </p>
                        <p className="text-gray-300 text-lg">
                          <span className="font-semibold text-white">Date:</span> {new Date(booking.date).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-gray-300 text-lg">
                          <span className="font-semibold text-white">Time:</span> {booking.time}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-3xl font-bold text-green-400">
                          ₹ {booking.price.toLocaleString()}
                        </p>
                        {booking.message && (
                          <p className="text-gray-300 text-lg">
                            <span className="font-semibold text-white">Message:</span> {booking.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-6">
                    {getStatusBadge(booking.status)}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {booking.status.toLowerCase() === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'rejected')}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-6 py-3 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {booking.status.toLowerCase() === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all"
                        >
                          Mark Complete
                        </button>
                      )}
                      
                      <Link
                        to={`/chat/${booking.id}`}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6 py-3 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Chat
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-16">
          <button
            onClick={fetchBookings}
            disabled={refreshing}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-10 py-5 rounded-full text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 mx-auto"
          >
            <RefreshCw className={`w-8 h-8 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Bookings'}
          </button>
        </div>
      </div>
    </div>
  );
}