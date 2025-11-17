// frontend/src/pages/ServiceDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Clock, DollarSign, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, notify } = useApp();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/services/api/${id}/`)
      .then(res => setService(res.data))
      .catch(() => notify('Service not found', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (pkg: any) => {
    if (!user) return notify('Please login to book', 'error');
    try {
      await axios.post('http://127.0.0.1:8000/services/api/book/${id}/', {
        package: pkg.id,
        preferred_date: '2025-11-20'
      });
      notify('Booking request sent!', 'success');
    } catch {
      notify('Booking failed', 'error');
    }
  };

  if (loading) return <p className="text-center py-20">Loading...</p>;
  if (!service) return <p className="text-center py-20 text-red-400">Service not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-20">
      <div className="container mx-auto px-6">
        <Link to="/" className="text-yellow-400 hover:underline mb-6 inline-block">← Back to Home</Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* LEFT: INFO */}
          <div className="md:col-span-2 space-y-6">
            <h1 className="text-4xl font-bold">{service.titleOverview}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="w-5 h-5" />
                <span>{service.provider}</span>
              </div>
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
              <p>{service.description}</p>
            </div>
          </div>

          {/* RIGHT: PACKAGES */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Choose Package</h2>
            {service.packages.map((pkg: any) => (
              <div key={pkg.package_type} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold capitalize">{pkg.package_type}</h3>
                <p className="text-3xl font-bold text-yellow-400">Rs. {pkg.price}</p>
                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.delivery_time} days</span>
                  </div>
                </div>
                <button
                  onClick={() => handleBook(pkg)}
                  className="w-full mt-4 bg-yellow-500 text-black py-3 rounded-full font-bold hover:bg-yellow-600"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}