// src/pages/ServiceDetailPage.tsx — FINAL VERSION (FIXED BOOKING TIME + SIZE + REAL DATA)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, MessageCircle, Calendar, Clock, Send, Check, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Package {
  id: number;
  package_type: string;
  title: string;
  price: number;
  delivery_time: number;
}

interface Service {
  id: number;
  titleOverview: string;
  provider: string;
  provider_id: number;
  description: string;
  overall_rating: number;
  packages: Package[];
}

interface Review {
  id: number;
  reviewer: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, notify } = useApp();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Booking Form
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState(''); // ← NOW ADDED & WORKING
  const [message, setMessage] = useState('');

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchService();
    fetchReviews();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${id}/`);
      setService(res.data);
      if (res.data.packages?.length > 0) {
        setSelectedPackage(res.data.packages[0]);
      }
    } catch (err) {
      notify('Failed to load service', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/reviews/${id}/`);
      setReviews(res.data);
    } catch (err) {
      console.log('No reviews yet');
    }
  };

  const handleBooking = async () => {
    if (!user) return notify('Please login first', 'error');
    if (!selectedPackage || !bookingDate || !bookingTime) return notify('Please fill all fields', 'error');

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE}/api/book/`, {
      overview: service?.id,
      package: selectedPackage.id,
      preferred_date: bookingDate,        // ← ONLY DATE (YYYY-MM-DD)
      preferred_time: bookingTime,        // ← optional, for display
      message: message
}, { headers: { Authorization: `Bearer ${token}` } });

      notify('Booking successful!', 'success');
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err: any) {
      notify(err.response?.data?.error || 'Booking failed', 'error');
    }
  };

  const submitReview = async () => {
    if (reviewRating === 0 || !reviewComment.trim()) {
      notify('Please give a rating and comment', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE}/api/reviews/${id}/`, {
        rating: reviewRating,
        comment: reviewComment,
      }, { headers: { Authorization: `Bearer ${token}` } });
      notify('Review submitted!', 'success');
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      notify('Failed to submit review', 'error');
    }
  };

  const StarRating = ({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-6 h-6 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center"><p className="text-white text-3xl">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 py-12">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-10">

            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h1 className="text-4xl font-bold text-white mb-4">{service?.titleOverview}</h1>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex-center text-4xl font-bold text-white border-4 border-white">
                  {service?.provider[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{service?.provider}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <StarRating rating={Number(avgRating)} />
                    <span className="text-2xl font-bold text-yellow-400">{avgRating}</span>
                    <span className="text-white/80">({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form — FIXED SIZE + TIME FIELD */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8">Book This Service</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Package */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Select Package</label>
                  <select 
                    value={selectedPackage?.id || ''} 
                    onChange={(e) => setSelectedPackage(service?.packages.find(p => p.id === Number(e.target.value)) || null)}
                    className="w-full bg-white/20 rounded-xl px-5 py-4 text-white border border-white/30 focus:border-cyan-400 transition"
                  >
                    <option value="">Choose package</option>
                    {service?.packages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.package_type} - Rs.{p.price} ({p.delivery_time} days)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Preferred Date</label>
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/20 rounded-xl px-5 py-4 text-white border border-white/30 focus:border-cyan-400 transition"
                  />
                </div>

                {/* Time — FIXED & ADDED */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Preferred Time</label>
                  <input 
                    type="time" 
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-5 py-4 text-white border border-white/30 focus:border-cyan-400 transition"
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="text-white/80 text-sm mb-2 block">Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any special requirements?"
                    rows={3}
                    className="w-full bg-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-400 border border-white/30 focus:border-cyan-400 transition resize-none"
                  />
                </div>
              </div>

              {/* Submit Button — FIXED SIZE */}
              <button
                onClick={handleBooking}
                disabled={!selectedPackage || !bookingDate || !bookingTime}
                className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 disabled:opacity-50 text-black font-bold text-2xl py-6 rounded-2xl shadow-2xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Check className="w-8 h-8" />
                BOOK NOW — Rs.{selectedPackage?.price.toLocaleString() || '0'}
              </button>
            </div>

            {/* Reviews Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Customer Reviews</h2>
                {user && (
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-xl">
                    {showReviewForm ? 'Cancel' : 'Write Review'}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="bg-white/10 p-6 rounded-2xl mb-8">
                  <p className="text-white mb-4">Your Rating</p>
                  <StarRating rating={reviewRating} interactive onRate={setReviewRating} />
                  <textarea className="w-full mt-4 bg-white/20 rounded-xl px-5 py-3 text-white placeholder-gray-400" rows={4} placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
                  <button onClick={submitReview} className="mt-4 bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl">Submit Review</button>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-center text-white/70 py-12 text-xl">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-white/5 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex-center text-white font-bold">
                            {r.reviewer[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold">{r.reviewer}</p>
                            <p className="text-white/60 text-sm">{new Date(r.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                      <p className="text-white/90">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Packages */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-6">Available Packages</h3>
              {service?.packages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer mb-4 transition-all ${selectedPackage?.id === pkg.id ? 'border-cyan-400 bg-cyan-500/20' : 'border-white/20 hover:border-white/40'}`}
                >
                  <h4 className="text-xl font-bold text-white capitalize">{pkg.package_type}</h4>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">Rs.{pkg.price.toLocaleString()}</p>
                  <p className="text-cyan-400 mt-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> {pkg.delivery_time} days delivery
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}