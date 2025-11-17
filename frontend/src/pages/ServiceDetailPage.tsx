import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Clock, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const { notify } = useApp();

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
    if (!selectedPkg || !selectedDate) {
      notify('Please select package and date', 'error');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/book/', {
        overview: service.id,
        package: selectedPkg.id,
        preferred_date: selectedDate,
      });
      notify('Booking sent! Seller will confirm.', 'success');
    } catch (err: any) {
      notify(err.response?.data?.error || 'Booking failed', 'error');
    }
  };

  if (loading) return <p className="text-center py-20 text-white">Loading...</p>;
  if (!service) return <p className="text-center py-20 text-red-400">Service not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-20">
      <div className="container mx-auto px-6">
        <Link to="/" className="text-yellow-400 hover:underline mb-6 inline-block">
          Back to Home
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* LEFT: INFO */}
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-4xl font-bold">{service.titleOverview}</h1>
            <div className="flex items-center gap-4">
              <span className="font-medium">by {service.provider}</span>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{service.overall_rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{service.distance_km} km</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-lg">{service.description || 'No description available'}</p>
            </div>
          </div>

          {/* RIGHT: PACKAGES */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Choose Package</h2>
            {service.packages.map((pkg: any) => (
              <div
                key={pkg.id}
                className={`bg-white/10 backdrop-blur rounded-xl p-6 border ${
                  selectedPkg?.id === pkg.id ? 'border-yellow-400' : 'border-white/20'
                }`}
              >
                <h3 className="text-xl font-bold capitalize">{pkg.package_type}</h3>
                <p className="text-3xl font-bold text-yellow-400">Rs. {pkg.price}</p>
                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.delivery_time} day(s)</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPkg(pkg)}
                  className={`w-full mt-4 py-2 rounded-full font-bold transition ${
                    selectedPkg?.id === pkg.id
                      ? 'bg-yellow-500 text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {selectedPkg?.id === pkg.id ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}

            {/* DATE PICKER */}
            {selectedPkg && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 mt-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Preferred Date
                </h3>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  onClick={handleBook}
                  className="w-full mt-4 bg-yellow-500 text-black py-3 rounded-full font-bold hover:bg-yellow-600 transition"
                >
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}