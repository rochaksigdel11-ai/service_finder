import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Clock, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const { notify } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:8000/services/api/${id}/`);
        setService(res.data);
      } catch (err: any) {
        notify(err.response?.data?.error || 'Service not found', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleBook = async () => {
    if (!selectedPackage || !selectedDate || !selectedTime) {
      notify('Please select package, date, and time', 'error');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/services/api/book/', {
        overview: service.id,
        package: selectedPackage.id,
        preferred_date: selectedDate,
        preferred_time: selectedTime,
      });
      notify('Booking sent! Seller will contact you soon.', 'success');
      navigate('/booking/confirm', { state: { booking: res.data } });
    } catch (err: any) {
      notify(err.response?.data?.error || 'Booking failed', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <p className="text-center py-20 text-white">Loading...</p>;
  if (!service) return <p className="text-center py-20 text-red-400">Service not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-yellow-400 hover:underline mb-6 inline-block">
          ← Back to Services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* SERVICE INFO */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-4xl font-bold text-white">{service.titleOverview}</h1>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <span className="font-semibold">by {service.provider}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{service.overall_rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{service.distance_km} km away</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
              <p className="text-gray-300 leading-relaxed">{service.description || 'No description available'}</p>
            </div>

            {/* REVIEWS SECTION */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Reviews ({service.reviews?.length || 0})</h2>
              {service.reviews && service.reviews.length > 0 ? (
                service.reviews.map((review: any) => (
                  <div key={review.id} className="mb-6 p-4 bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white">{review.clientName}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No reviews yet. Be the first!</p>
              )}
            </div>
          </div>

          {/* BOOKING PANEL */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Package</h2>
              {service.packages.map((pkg: any) => (
                <div
                  key={pkg.id}
                  className={`p-6 rounded-xl border mb-4 transition-all ${
                    selectedPackage?.id === pkg.id ? 'border-yellow-400 bg-yellow-500/10' : 'border-white/20'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white capitalize">{pkg.package_type}</h3>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">Rs. {pkg.price}</p>
                  <div className="space-y-2 mt-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{pkg.delivery_time} day(s)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPackage(pkg)}
                    className={`w-full mt-4 py-3 rounded-xl font-bold transition ${
                      selectedPackage?.id === pkg.id
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {selectedPackage?.id === pkg.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>

            {/* BOOKING FORM */}
            {selectedPackage && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Book Appointment</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Time</option>
                      <option value="09:00-11:00">9:00 AM - 11:00 AM</option>
                      <option value="11:00-13:00">11:00 AM - 1:00 PM</option>
                      <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                      <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                    </select>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={bookingLoading || !selectedDate || !selectedTime}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:scale-105 transition disabled:opacity-50"
                  >
                    {bookingLoading ? 'Confirming...' : `Book for Rs. ${selectedPackage.price}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}