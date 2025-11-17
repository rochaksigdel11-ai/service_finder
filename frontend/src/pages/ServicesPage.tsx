// frontend/src/pages/ServicesPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Search, MessageCircle, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Package {
  package_type: string;
  title: string;
  price: number;
  delivery_time: number;
}

interface Service {
  id: number;
  titleOverview: string;
  provider: string;
  overall_rating: number;
  distance_km: number;
  packages: Package[];
}

export default function ServicesPage() {
  const { user, setShowLogin, notify } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<Service[]>('http://127.0.0.1:8000/api/')
      .then(res => {
        console.log('Services:', res.data);
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        notify('Failed to load services', 'error');
        setLoading(false);
      });
  }, [notify]);

  const filtered = services.filter(s =>
    s.titleOverview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
    ));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="text-white">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-white text-center mb-8">Find Trusted Freelancers</h1>

        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => (
            <div
              key={s.id}
              className="bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition cursor-pointer"
              onClick={() => navigate(`/service/${s.id}`)}
            >
              <div className="h-40 bg-gradient-to-br from-violet-600 to-indigo-600" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-1">{s.titleOverview}</h3>
                <p className="text-sm text-slate-400 mb-3">by {s.provider}</p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    {renderStars(s.overall_rating)}
                    <span className="text-slate-300 ml-1">{s.overall_rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{s.distance_km.toFixed(1)} km</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/service/${s.id}`); }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg font-bold text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (user) notify('Chat initiated!', 'success');
                      else setShowLogin(true);
                    }}
                    className="flex-1 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black py-2 rounded-lg font-bold text-sm transition"
                  >
                    {user ? 'Chat' : 'Login to Chat'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}