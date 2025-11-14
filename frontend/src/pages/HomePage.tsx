import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Briefcase, UserPlus, Star, MapPin, Clock, DollarSign, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Service = {
  id: number;
  title: string;
  provider: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  location: string;
  description: string;
};

export default function HomePage() {
  const { user, setShowLogin, notify } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Services', icon: '🏠' },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'carpentry', name: 'Carpentry', icon: '🪚' },
    { id: 'painting', name: 'Painting', icon: '🎨' },
    { id: 'gardening', name: 'Gardening', icon: '🌱' },
  ];

  useEffect(() => {
    axios.get('/api/services/')  // Fetch from backend
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setError('Failed to load services.');
        notify('Failed to load services', 'error');
        setLoading(false);
      });
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePostJob = () => {
    if (user) {
      notify('Posting job feature coming soon!', 'success');
    } else {
      setShowLogin(true);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
    ));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="text-slate-300">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 to-indigo-900 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Find Trusted Service Providers in Nepal</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">Connect with verified professionals for all your service needs.</p>
        
        {/* Search & Categories */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 justify-center md:justify-start">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === cat.id ? 'bg-violet-600 text-white' : 'bg-transparent border border-white text-white hover:bg-white hover:text-violet-600'}`}
              >
                <span>{cat.icon}</span>
                <span className="text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/services">
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition">
              <Briefcase className="w-5 h-5" />
              Browse Services
            </button>
          </Link>
          <button
            onClick={handlePostJob}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-violet-600 transition"
          >
            <UserPlus className="w-5 h-5" />
            {user ? 'Post a Job' : 'Get Started'}
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {error && <p className="col-span-full text-center text-rose-400">{error}</p>}
          {filteredServices.length === 0 ? (
            <p className="col-span-full text-center text-slate-400">No services found.</p>
          ) : (
            filteredServices.map(service => (
              <div key={service.id} className="bg-slate-800 rounded-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = `/service/${service.id}`}>
                <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-slate-400 mb-2">by {service.provider}</p>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(service.rating)}
                    <span className="text-sm text-slate-300 ml-1">({service.reviews})</span>
                  </div>
                  <div className="flex items-center text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {service.location}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="text-lg font-bold">Rs. {service.price}</span>
                  </div>
                  <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    Contact
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 text-slate-300 mt-12">
          <div><span className="text-2xl font-bold text-white block">10K+</span> Providers</div>
          <div><span className="text-2xl font-bold text-white block">500+</span> Services</div>
          <div><span className="text-2xl font-bold text-white block">4.8</span> Rating</div>
        </div>
      </div>
    </div>
  );
}