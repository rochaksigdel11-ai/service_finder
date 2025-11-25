// src/pages/ServiceDetailPage.tsx - FIXED WITH ERROR HANDLING
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, MessageCircle, Calendar, Clock, Send, Check } from 'lucide-react';
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
  packages: Package[];
}

export default function ServiceDetail() {
  const { id } = useParams();
  const { user, notify } = useApp();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Booking Form State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/services/${id}/`);
      console.log("Service data:", res.data);
      
      // Check if response is HTML (API error)
      if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
        throw new Error('API returned HTML instead of JSON');
      }
      
      setService(res.data);
      
      // Set first package as default
      if (res.data.packages && res.data.packages.length > 0) {
        setSelectedPackage(res.data.packages[0]);
      }
    } catch (err) {
      console.error("Failed to load service:", err);
      setApiError(true);
      notify("Using demo service data", "success");
      // Demo data with proper package structure
      setService({
        id: Number(id),
        titleOverview: "Professional Web Development Service",
        provider: "raju",
        packages: [
          { id: 1, package_type: 'basic', title: 'Basic Website', price: 12000, delivery_time: 7 },
          { id: 2, package_type: 'standard', title: 'Standard Website', price: 25000, delivery_time: 5 },
          { id: 3, package_type: 'premium', title: 'Premium Website', price: 45000, delivery_time: 3 }
        ]
      });
      setSelectedPackage({ id: 1, package_type: 'basic', title: 'Basic Website', price: 12000, delivery_time: 7 });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      notify("Please login first!", "error");
      return;
    }

    if (!selectedPackage || !bookingDate || !bookingTime) {
      notify("Please fill all required fields", "error");
      return;
    }

    const bookingData = {
      overview: service?.id,
      package: selectedPackage.id,
      preferred_date: bookingDate,
      message: message || `Booking for ${selectedPackage.title}`
    };

    console.log("Sending booking data:", bookingData);

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post('http://127.0.0.1:8000/api/book/', bookingData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      notify("Booking created successfully!", "success");
      console.log("✅ REAL BOOKING CREATED:", res.data);
    } catch (err: any) {
      console.error("Booking error:", err.response?.data);
      notify(`Booking failed: ${err.response?.data?.error || 'Unknown error'}`, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <p className="text-white text-2xl">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4">Service Not Found</p>
          {apiError && (
            <p className="text-yellow-400">
              API connection issue - using demo data
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 py-12">
      <div className="container mx-auto px-6">
        {/* API Error Banner */}
        {apiError && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-6 text-yellow-200">
            <p className="text-lg">⚠️ Using demo data - API connection issue</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left - Service Info */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">{service.titleOverview}</h1>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-5xl font-bold border-4 border-white">
                  {/* ✅ FIXED: Safe access to provider */}
                  {service?.provider?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{service.provider}</p>
                  <p className="text-cyan-400 text-xl">Top Rated • Nepal</p>
                </div>
              </div>
            </div>

            {/* REAL BOOKING FORM */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
              <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-4">
                <Calendar className="w-12 h-12 text-cyan-400" />
                Schedule Your Booking
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-lg mb-3 block">Package</label>
                  <select 
                    value={selectedPackage?.id || ''} 
                    onChange={(e) => {
                      const pkgId = Number(e.target.value);
                      const pkg = service.packages.find(p => p.id === pkgId);
                      setSelectedPackage(pkg || null);
                    }}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl"
                  >
                    <option value="">Select a package</option>
                    {service.packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.package_type} - ₹{pkg.price} ({pkg.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white text-lg mb-3 block">Date</label>
                  <input 
                    type="date" 
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl" 
                    required 
                  />
                </div>

                <div>
                  <label className="text-white text-lg mb-3 block">Preferred Time</label>
                  <input 
                    type="time" 
                    value={bookingTime} 
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl" 
                    required 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-white text-lg mb-3 block">Message to Seller</label>
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl resize-none"
                    placeholder="Tell the seller about your project..."
                    rows={4}
                  ></textarea>
                </div>
              </div>

              <button 
                onClick={handleBooking}
                disabled={!selectedPackage || !bookingDate || !bookingTime}
                className="mt-10 w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-600 text-black font-bold text-3xl py-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-4 disabled:transform-none disabled:hover:scale-100"
              >
                <Check className="w-12 h-12" />
                CONFIRM BOOKING NOW - {selectedPackage ? `₹${selectedPackage.price}` : ''}
              </button>
            </div>
          </div>

          {/* Right - Packages & Info */}
          <div className="space-y-8">
            {/* Packages */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-6">Available Packages</h3>
              <div className="space-y-4">
                {service.packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={`p-4 rounded-xl border-2 ${
                      selectedPackage?.id === pkg.id 
                        ? 'border-cyan-500 bg-cyan-500/20' 
                        : 'border-white/20 bg-white/5'
                    } cursor-pointer transition-all`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-bold text-white">{pkg.package_type}</h4>
                      <span className="text-2xl font-bold text-yellow-400">₹{pkg.price}</span>
                    </div>
                    <p className="text-gray-300 mt-2">{pkg.title}</p>
                    <p className="text-cyan-400">Delivery: {pkg.delivery_time} days</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-8 text-black">
              <h3 className="text-3xl font-bold mb-4">100% Secure</h3>
              <ul className="space-y-4 text-xl">
                <li className="flex items-center gap-3"><Check className="w-8 h-8" /> Verified Freelancers</li>
                <li className="flex items-center gap-3"><Check className="w-8 h-8" /> Money Safe</li>
                <li className="flex items-center gap-3"><Check className="w-8 h-8" /> 24/7 Support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}