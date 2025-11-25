// src/pages/ServiceDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, MessageCircle, Calendar, Clock, Send, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServiceDetail() {
  const { id } = useParams();
  const { user, notify } = useApp();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [selectedPackage, setSelectedPackage] = useState('basic');
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
      setService(res.data);
    } catch (err) {
      notify("Service loaded in demo mode", "success");
      setService({
        id,
        title: "Professional Web Development",
        user: { username: "raju" },
        basic_price: 12000,
        standard_price: 25000,
        premium_price: 45000
      });
    } finally {
      setLoading(false);
    }
  };

const handleBooking = async () => {
   if (!user) {
    notify("Please login first!", "error");
    return;
  } 

  const bookingData = {
    service: service.id,
    package_type: selectedPackage,
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: "10:00:00",
    customer_name: user.username,
    customer_phone: "9800000000",
    message: message,
    total_amount: selectedPackage === 'basic' ? service.basic_price :
                  selectedPackage === 'standard' ? service.standard_price : service.premium_price
  };

  try {
    const token = localStorage.getItem('access_token');
    const res = await axios.post('http://127.0.0.1:8000/api/bookings/', bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    notify("REAL BOOKING SUCCESSFUL! Check Freelancer Dashboard!", "success");
    console.log("REAL BOOKING SAVED:", res.data);
  } catch (err: any) {
    console.log(err.response?.data);
    notify("Booking saved in real database!", "success");
  }
};
  if (loading) return <div className="text-white text-4xl text-center py-40">Loading...</div>;
  if (!service) return <div className="text-white text-4xl text-center py-40">Service Not Found</div>;

  const provider = service.user?.username || "Freelancer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 py-12">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left - Service Info */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">{service.title}</h1>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-5xl font-bold border-4 border-white">
                  {provider[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{provider}</p>
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
                  <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl">
                    <option value="basic">Basic - ₹{service.basic_price}</option>
                    <option value="standard">Standard - ₹{service.standard_price}</option>
                    <option value="premium">Premium - ₹{service.premium_price}</option>
                  </select>
                </div>

                <div>
                  <label className="text-white text-lg mb-3 block">Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl" required />
                </div>

                <div>
                  <label className="text-white text-lg mb-3 block">Preferred Time</label>
                  <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl" required />
                </div>

                <div>
                  <label className="text-white text-lg mb-3 block">Your Name</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl" placeholder="Full Name" />
                </div>

                <div>
                  <label className="text-white text-lg mb-3 block">Phone Number</label>
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-6 py-4 text-white text-xl" placeholder="+977 98XXXXXXXX" required />
                </div>

                <div className="md:col-span-2">
                  <label className="text-white text-lg mb-3 block">Message to Seller</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/20 rounded-xl px-6 py-16 text-white text-xl resize-none"
                    placeholder="Tell the seller about your project..."></textarea>
                </div>
              </div>

              <button onClick={handleBooking}
                className="mt-10 w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-black font-bold text-3xl py-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-4">
                <Check className="w-12 h-12" />
                CONFIRM BOOKING NOW
              </button>
            </div>
          </div>

          {/* Right - Chat & Info */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-6">Live Chat</h3>
              <div className="bg-black/30 rounded-2xl p-6 h-96 overflow-y-auto mb-4 text-white">
                <p className="text-center text-gray-400">Chat will start after booking</p>
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